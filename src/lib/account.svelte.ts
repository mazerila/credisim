import type { Auth, User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore/lite';
import { firebaseConfig } from './firebase/config';
import { i18n } from './i18n/index.svelte';
import { track } from './analytics';
import type { Saved } from './export';

export { errorKey } from './accountErrors';

/**
 * Optional account (Firebase Auth: Google or email + password) to keep saved simulations
 * on every device. Nothing here is needed to use Credisim.
 *
 * - The Auth SDK is loaded only when someone opens the sign-in panel, or on start-up when
 *   this browser was signed in last time (flag below), so anonymous visitors don't pay for it.
 * - Saved simulations live in Firestore at users/<uid>/sims/<id> as { name, hash, at };
 *   the rules (firestore.rules) let only the owner read and write them.
 * - Free: project on the Spark plan (no billing account), so usage can't be charged.
 */

export interface AccountUser {
  uid: string;
  email: string;
  name: string;
  /** 'google.com' or 'password' */
  provider: string;
}

export const account = $state<{ enabled: boolean; ready: boolean; user: AccountUser | null; panelOpen: boolean }>({
  enabled: !!firebaseConfig,
  ready: false,
  user: null,
  panelOpen: false,
});

const FLAG = 'credisim.account';
const MAX_SIMS = 100;
const setFlag = (on: boolean) => {
  try { if (on) localStorage.setItem(FLAG, '1'); else localStorage.removeItem(FLAG); } catch { /* storage blocked */ }
};
const hasFlag = () => { try { return localStorage.getItem(FLAG) === '1'; } catch { return false; } };

let authP: Promise<Auth> | null = null;
let dbP: Promise<Firestore> | null = null;
let current: User | null = null;

async function app() {
  const { getApp, getApps, initializeApp } = await import('firebase/app');
  return getApps().length ? getApp() : initializeApp(firebaseConfig!);
}

function getAuthInstance(): Promise<Auth> {
  return (authP ??= (async () => {
    const a = await import('firebase/auth');
    const auth = a.initializeAuth(await app(), {
      persistence: [a.indexedDBLocalPersistence, a.browserLocalPersistence],
      popupRedirectResolver: a.browserPopupRedirectResolver,
    });
    auth.languageCode = i18n.lang;
    a.onAuthStateChanged(auth, (u) => {
      current = u;
      account.user = u ? toUser(u) : null;
      account.ready = true;
      setFlag(!!u);
    });
    return auth;
  })());
}

function db(): Promise<Firestore> {
  return (dbP ??= (async () => {
    await getAuthInstance(); // Firestore sends the signed-in user's token
    const { getFirestore } = await import('firebase/firestore/lite');
    return getFirestore(await app());
  })());
}

function toUser(u: User): AccountUser {
  const provider = u.providerData[0]?.providerId ?? 'password';
  return { uid: u.uid, email: u.email ?? '', name: u.displayName ?? '', provider };
}

/** Restore the session on start-up, only if this browser was signed in before. */
export function initAccount() {
  if (!account.enabled) return;
  if (hasFlag()) getAuthInstance().catch(() => (account.ready = true));
  else account.ready = true;
}

/** Load the SDK ahead of a click (when the panel opens), so the popup isn't blocked. */
export function warmUp() {
  if (account.enabled) getAuthInstance().catch(() => {});
}

export async function signInGoogle() {
  const auth = await getAuthInstance();
  const a = await import('firebase/auth');
  auth.languageCode = i18n.lang;
  const provider = new a.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const cred = await a.signInWithPopup(auth, provider);
    track('account_signed_in', { method: 'google', new: !!a.getAdditionalUserInfo(cred)?.isNewUser });
  } catch (e) {
    if ((e as { code?: string }).code === 'auth/popup-blocked') {
      setFlag(true); // finish the sign-in after the redirect
      await a.signInWithRedirect(auth, provider);
      return;
    }
    throw e;
  }
}

export async function signInEmail(email: string, password: string) {
  const auth = await getAuthInstance();
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  await signInWithEmailAndPassword(auth, email.trim(), password);
  track('account_signed_in', { method: 'password', new: false });
}

export async function createAccount(email: string, password: string) {
  const auth = await getAuthInstance();
  const { createUserWithEmailAndPassword } = await import('firebase/auth');
  await createUserWithEmailAndPassword(auth, email.trim(), password);
  track('account_signed_in', { method: 'password', new: true });
}

export async function resetPassword(email: string) {
  const auth = await getAuthInstance();
  const { sendPasswordResetEmail } = await import('firebase/auth');
  auth.languageCode = i18n.lang;
  await sendPasswordResetEmail(auth, email.trim());
  track('account_password_reset');
}

export async function signOut() {
  const auth = await getAuthInstance();
  const { signOut } = await import('firebase/auth');
  await signOut(auth);
  track('account_signed_out');
}

/** Delete every saved simulation, then the account. Password accounts confirm with their password. */
export async function deleteAccount(password?: string) {
  await getAuthInstance();
  const a = await import('firebase/auth');
  const u = current;
  if (!u) return;
  // Deleting an account needs a recent sign-in: confirm first, so nothing is deleted halfway.
  if (u.providerData[0]?.providerId === 'google.com') await a.reauthenticateWithPopup(u, new a.GoogleAuthProvider(), a.browserPopupRedirectResolver);
  else await a.reauthenticateWithCredential(u, a.EmailAuthProvider.credential(u.email ?? '', password ?? ''));
  for (const s of await listCloud()) await deleteCloud(s.id);
  await a.deleteUser(u);
  setFlag(false);
  track('account_deleted');
}

// ---------- saved simulations in the account ----------

async function sims() {
  const uid = current?.uid;
  if (!uid) throw new Error('Not signed in');
  const { collection } = await import('firebase/firestore/lite');
  return collection(await db(), 'users', uid, 'sims');
}

export async function listCloud(): Promise<Saved[]> {
  const { getDocs, orderBy, query, limit } = await import('firebase/firestore/lite');
  const snap = await getDocs(query(await sims(), orderBy('at', 'desc'), limit(MAX_SIMS)));
  return snap.docs.map((d) => {
    const v = d.data() as { name?: string; hash?: string; at?: { toDate(): Date } };
    return { id: d.id, name: v.name ?? '', hash: v.hash ?? '', at: (v.at?.toDate() ?? new Date()).toISOString() };
  });
}

/** `at`: keep the original date when copying from this browser; otherwise the server time. */
export async function saveCloud(name: string, hash: string, at?: Date): Promise<void> {
  const { addDoc, serverTimestamp, Timestamp } = await import('firebase/firestore/lite');
  await addDoc(await sims(), {
    name: (name.trim() || new Date().toLocaleString()).slice(0, 80),
    hash: hash.replace(/^#/, ''),
    at: at && at.getTime() < Date.now() ? Timestamp.fromDate(at) : serverTimestamp(),
  });
}

export async function deleteCloud(id: string): Promise<void> {
  const { deleteDoc, doc } = await import('firebase/firestore/lite');
  await deleteDoc(doc(await sims(), id));
}

/** Copy simulations saved in this browser into the account, with their dates. */
export async function importLocal(list: Saved[]): Promise<void> {
  for (const s of list) await saveCloud(s.name, s.hash, new Date(s.at));
  track('simulations_imported', { count: list.length });
}
