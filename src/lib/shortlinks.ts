import { createShortLinks, ID_PATTERN } from '@credisim/shortlink';
import { firestoreBackend } from '@credisim/shortlink/firestore';
import { firebaseConfig } from './firebase/config';
import { decodePayload, type ShareState } from './share';

/**
 * Short share links (https://…/s/<id>) backed by Firestore through the reusable
 * @credisim/shortlink package. Off when Firebase is not configured.
 */
const links = firebaseConfig
  ? createShortLinks({ backend: firestoreBackend(firebaseConfig), namespace: 'credisim', version: 3 })
  : null;

export const shortLinksEnabled = !!links;

const PATH = /^\/s\/([A-Za-z0-9]{6,16})\/?$/;

/** Store the payload and return the short URL, or null if short links are off or the store failed. */
export async function createShortUrl(payload: string): Promise<string | null> {
  if (!links) return null;
  try {
    const id = await links.create(payload);
    return `${location.origin}/s/${id}`;
  } catch {
    return null;
  }
}

/** If the page was opened at /s/<id>, load that simulation. */
export async function stateFromShortPath(pathname = location.pathname): Promise<ShareState | null> {
  const m = pathname.match(PATH);
  if (!m || !links || !ID_PATTERN.test(m[1])) return null;
  try {
    const found = await links.resolve(m[1]);
    return found ? decodePayload(found.payload) : null;
  } catch {
    return null;
  }
}

export const isShortPath = (pathname = location.pathname) => PATH.test(pathname);
