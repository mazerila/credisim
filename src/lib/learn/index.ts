import type { Lang } from '../i18n/index.svelte';
import { en } from './en';
import { fr } from './fr';
import type { Content, TopicId } from './types';

export type { Article, Block, ExampleId, TopicId } from './types';

export const GROUPS: { key: 'basics' | 'costs' | 'rules' | 'about'; topics: TopicId[] }[] = [
  { key: 'basics', topics: ['loan', 'monthly-payment', 'amortization', 'taeg'] },
  { key: 'costs', topics: ['insurance', 'guarantee', 'notary'] },
  { key: 'rules', topics: ['usury', 'debt-ratio', 'consumer-credit', 'ptz'] },
  { key: 'about', topics: ['calculator', 'glossary'] },
];

export const TOPICS: TopicId[] = GROUPS.flatMap((g) => g.topics);

const CONTENT: Record<Lang, Content> = { en, fr };

export function article(lang: Lang, id: TopicId) {
  return CONTENT[lang][id];
}

export function isTopic(v: string): v is TopicId {
  return (TOPICS as string[]).includes(v);
}

/** Tiny inline renderer: escapes HTML, then **bold** and [text](#learn/x). Content is ours, not user input. */
export function inline(s: string): string {
  const esc = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((#learn(?:\/[\w-]+)?)\)/g, '<a href="$2">$1</a>');
}
