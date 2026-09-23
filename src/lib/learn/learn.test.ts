import { describe, expect, it } from 'vitest';
import { en } from './en';
import { fr } from './fr';
import { inline, isTopic, TOPICS } from './index';
import { TOOLS } from '../router.svelte';
import type { Block, Content } from './types';

const texts = (b: Block): string[] =>
  'p' in b ? [b.p] : 'note' in b ? [b.note] : 'list' in b ? b.list : 'steps' in b ? b.steps
  : 'table' in b ? b.table.rows.flat() : 'terms' in b ? b.terms.map((x) => x.def) : [];

describe('Learn content', () => {
  for (const [lang, content] of [['en', en], ['fr', fr]] as [string, Content][]) {
    it(`${lang}: has every topic, with the same blocks as English`, () => {
      expect(Object.keys(content).sort()).toEqual([...TOPICS].sort());
      for (const id of TOPICS) {
        expect(content[id].blocks.map((b) => Object.keys(b)[0])).toEqual(en[id].blocks.map((b) => Object.keys(b)[0]));
      }
    });
    it(`${lang}: every internal link points to a real topic`, () => {
      for (const id of TOPICS) {
        for (const b of content[id].blocks) {
          for (const s of texts(b)) for (const m of s.matchAll(/\(#learn\/([\w-]+)\)/g)) expect(isTopic(m[1]), `${id}: ${m[1]}`).toBe(true);
          for (const s of texts(b)) for (const m of s.matchAll(/\(#tools\/([\w-]+)\)/g)) expect((TOOLS as readonly string[]).includes(m[1]), `${id}: ${m[1]}`).toBe(true);
          if ('terms' in b) for (const term of b.terms) if (term.link) expect(isTopic(term.link)).toBe(true);
        }
      }
    });
  }
  it('renders bold and links, and escapes HTML', () => {
    expect(inline('**a** [b](#learn/taeg) <i>')).toBe('<strong>a</strong> <a href="#learn/taeg">b</a> &lt;i&gt;');
  });
});
