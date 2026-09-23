/** Ids of the live examples an article can embed (rendered by components/learn/Example.svelte). */
export type ExampleId = 'payment' | 'amortization' | 'taeg' | 'insurance' | 'notary' | 'debt' | 'usury' | 'ptz' | 'durations' | 'loanTypes';

/**
 * Article content. Text supports **bold** and [links](#learn/topic).
 * Blocks are rendered in order.
 */
export type Block =
  | { h: string }
  | { p: string }
  | { list: string[] }
  | { steps: string[] }
  | { note: string }
  | { example: ExampleId }
  | { table: { head: string[]; rows: string[][] } }
  | { terms: { term: string; def: string; link?: TopicId }[] };

export type TopicId =
  | 'loan' | 'monthly-payment' | 'amortization' | 'loan-types' | 'taeg'
  | 'insurance' | 'guarantee' | 'notary'
  | 'usury' | 'debt-ratio' | 'consumer-credit' | 'ptz'
  | 'check-offer' | 'early-repayment' | 'renegotiation'
  | 'calculator' | 'glossary';

export interface Article {
  title: string;
  lead: string;
  /** minutes */
  read: number;
  blocks: Block[];
}

export type Content = Record<TopicId, Article>;
