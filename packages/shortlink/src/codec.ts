/**
 * Compact, URL-safe encoding of any JSON value: JSON → deflate-raw → base64url.
 * Uses the platform CompressionStream (all modern browsers, Node ≥ 18); falls back
 * to plain base64url when it is missing. The first character tells which one was used,
 * so both kinds decode.
 */

const PLAIN = 'j';
const DEFLATE = 'z';

export function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

const hasStreams = () => typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';

export async function encode(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  if (!hasStreams()) return PLAIN + toBase64Url(bytes);
  return DEFLATE + toBase64Url(await pipe(bytes, new CompressionStream('deflate-raw')));
}

/** Decode a string made by `encode`. Throws on malformed input. */
export async function decode<T = unknown>(s: string): Promise<T> {
  const kind = s[0];
  const body = fromBase64Url(s.slice(1));
  let bytes: Uint8Array;
  if (kind === DEFLATE) bytes = await pipe(body, new DecompressionStream('deflate-raw'));
  else if (kind === PLAIN) bytes = body;
  else throw new Error('Unknown encoding');
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}
