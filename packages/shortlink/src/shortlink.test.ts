import { describe, expect, it } from 'vitest';
import { createShortLinks, decode, encode, ID_PATTERN, memoryBackend, randomId, type ShortLinkBackend } from './index';

describe('codec', () => {
  it('round-trips JSON with accents and compresses repetitive data', async () => {
    const value = { name: 'Prêt à taux zéro', list: Array.from({ length: 50 }, (_, i) => ({ k: 'mensualité', i })) };
    const s = await encode(value);
    expect(s).toMatch(/^[zj][A-Za-z0-9_-]+$/);
    expect(await decode(s)).toEqual(value);
    expect(s.length).toBeLessThan(JSON.stringify(value).length / 4);
  });
  it('rejects unknown input', async () => {
    await expect(decode('x123')).rejects.toThrow();
  });
});

describe('short links', () => {
  it('creates readable, unambiguous ids', () => {
    const id = randomId(8);
    expect(id).toMatch(ID_PATTERN);
    expect(id).not.toMatch(/[0O1lI]/);
  });
  it('stores and resolves a payload within its namespace only', async () => {
    const backend = memoryBackend();
    const a = createShortLinks({ backend, namespace: 'credisim', version: 3 });
    const b = createShortLinks({ backend, namespace: 'other' });
    const id = await a.create('z-payload');
    expect(await a.resolve(id)).toEqual({ payload: 'z-payload', version: 3 });
    expect(await b.resolve(id)).toBeNull();
    expect(await a.resolve('bad id!')).toBeNull();
    expect(await a.resolve('Unknown123')).toBeNull();
  });
  it('retries when an id is already taken', async () => {
    const mem = memoryBackend();
    let fails = 2;
    const flaky: ShortLinkBackend = { get: mem.get, create: async (id, r) => { if (fails-- > 0) throw new Error('exists'); return mem.create(id, r); } };
    const links = createShortLinks({ backend: flaky, namespace: 'x' });
    await links.create('p');
    expect(mem.size()).toBe(1);
  });
  it('refuses oversized payloads', async () => {
    const links = createShortLinks({ backend: memoryBackend(), namespace: 'x', maxLength: 10 });
    await expect(links.create('x'.repeat(11))).rejects.toThrow('too large');
  });
});
