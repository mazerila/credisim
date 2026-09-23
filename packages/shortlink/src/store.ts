/**
 * Short-ID link store, independent of any database. A backend only has to
 * read one record and create one record that must not already exist.
 */

export interface ShortLinkRecord {
  /** the stored payload (usually a string made by `encode`) */
  d: string;
  /** namespace: which app or feature created it, e.g. "credisim" */
  ns: string;
  /** format version chosen by the app */
  v: number;
}

export interface ShortLinkBackend {
  get(id: string): Promise<ShortLinkRecord | null>;
  /** create the record; must fail (throw) if the id already exists */
  create(id: string, record: ShortLinkRecord): Promise<void>;
}

export interface ShortLinkOptions {
  backend: ShortLinkBackend;
  namespace: string;
  /** id length, 6–16 characters of [A-Za-z0-9] (default 8: 218 trillion ids) */
  idLength?: number;
  /** payload format version stored with each link (default 1) */
  version?: number;
  /** refuse payloads longer than this (default 8,000 characters) */
  maxLength?: number;
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'; // no 0/O, 1/l/I
export const ID_PATTERN = /^[A-Za-z0-9]{6,16}$/;

export function randomId(length = 8): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let id = '';
  for (const b of bytes) id += ALPHABET[b % ALPHABET.length];
  return id;
}

export function createShortLinks(opts: ShortLinkOptions) {
  const length = Math.min(16, Math.max(6, opts.idLength ?? 8));
  const version = opts.version ?? 1;
  const maxLength = opts.maxLength ?? 8000;

  return {
    /** Store a payload and return its new short id. */
    async create(payload: string): Promise<string> {
      if (payload.length > maxLength) throw new Error('Payload too large');
      let lastError: unknown;
      for (let attempt = 0; attempt < 4; attempt++) {
        const id = randomId(length);
        try {
          await opts.backend.create(id, { d: payload, ns: opts.namespace, v: version });
          return id;
        } catch (e) {
          lastError = e; // id taken (or transient error): try another id
        }
      }
      throw lastError instanceof Error ? lastError : new Error('Could not create the short link');
    },

    /** The payload for an id, or null if unknown, malformed or from another namespace. */
    async resolve(id: string): Promise<{ payload: string; version: number } | null> {
      if (!ID_PATTERN.test(id)) return null;
      const rec = await opts.backend.get(id);
      if (!rec || rec.ns !== opts.namespace || typeof rec.d !== 'string') return null;
      return { payload: rec.d, version: rec.v };
    },
  };
}

/** In-memory backend: tests, demos, or a stand-in when no database is configured. */
export function memoryBackend(): ShortLinkBackend & { size(): number } {
  const map = new Map<string, ShortLinkRecord>();
  return {
    async get(id) { return map.get(id) ?? null; },
    async create(id, rec) {
      if (map.has(id)) throw new Error('exists');
      map.set(id, rec);
    },
    size: () => map.size,
  };
}
