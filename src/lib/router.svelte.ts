import { isTopic, type TopicId } from './learn';

export type View = 'sim' | 'learn' | 'tools';
export const TOOLS = ['early-repayment', 'renegotiation', 'insurance-switch', 'check-offer'] as const;
export type ToolId = (typeof TOOLS)[number];
const isTool = (v: string): v is ToolId => (TOOLS as readonly string[]).includes(v);

/**
 * Hash routes:  #learn  ·  #learn/<topic>  ·  #tools  ·  #tools/<tool>  ·  #s=<shared simulation>  ·  #sim or empty = simulator.
 * The simulator keeps its share link in the hash; the Learn pages use their own.
 */
export const route = $state<{ view: View; topic: TopicId | null; tool: ToolId | null }>({ view: 'sim', topic: null, tool: null });

export function parseRoute(hash = location.hash) {
  const m = hash.match(/^#(learn|tools)(?:\/([\w-]+))?$/);
  if (m) {
    route.view = m[1] as View;
    route.topic = m[1] === 'learn' && m[2] && isTopic(m[2]) ? m[2] : null;
    route.tool = m[1] === 'tools' && m[2] && isTool(m[2]) ? m[2] : null;
    return true;
  }
  route.view = 'sim';
  route.topic = null;
  route.tool = null;
  return false;
}

export function goLearn(topic: TopicId | null = null) {
  location.hash = topic ? `#learn/${topic}` : '#learn';
}
