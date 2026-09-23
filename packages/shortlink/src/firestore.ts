import type { FirebaseApp, FirebaseOptions } from 'firebase/app';
import type { ShortLinkBackend, ShortLinkRecord } from './store';

/**
 * Firestore backend (Firestore Lite, loaded on first use: no cost to pages that never share).
 * Records live in `collection/<id>` as { d, ns, v, at }. Pair it with the security rules in
 * this package's README: anyone can read one id or create a new one; nothing can be listed,
 * changed or deleted from the client.
 */
export function firestoreBackend(app: FirebaseApp | FirebaseOptions, collectionName = 'links'): ShortLinkBackend {
  let db: Promise<import('firebase/firestore/lite').Firestore> | null = null;
  const lite = () => import('firebase/firestore/lite');
  const getDb = () =>
    (db ??= (async () => {
      const { getApp, getApps, initializeApp } = await import('firebase/app');
      const { getFirestore } = await lite();
      const instance = 'options' in app ? (app as FirebaseApp) : getApps().length ? getApp() : initializeApp(app as FirebaseOptions);
      return getFirestore(instance);
    })());

  return {
    async get(id) {
      const [{ doc, getDoc }, firestore] = await Promise.all([lite(), getDb()]);
      const snap = await getDoc(doc(firestore, collectionName, id));
      return snap.exists() ? (snap.data() as ShortLinkRecord) : null;
    },
    async create(id, record) {
      const [{ doc, setDoc, serverTimestamp }, firestore] = await Promise.all([lite(), getDb()]);
      // The rules only allow creating a document that does not exist yet, so a taken id fails.
      await setDoc(doc(firestore, collectionName, id), { ...record, at: serverTimestamp() });
    },
  };
}
