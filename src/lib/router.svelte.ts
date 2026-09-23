import { isTopic, type TopicId } from './learn';

export type View = 'sim' | 'learn';

/**
 * Hash routes:  #learn  ·  #learn/<topic>  ·  #s=<shared simulation>  ·  #sim or empty = simulator.
 * The simulator keeps its share link in the hash; the Learn pages use their own.
 */
export const route = $state<{ view: View; topic: TopicId | null }>({ view: 'sim', topic: null });

export function parseRoute(hash = location.hash) {
  const m = hash.match(/^#learn(?:\/([\w-]+))?$/);
  if (m) {
    route.view = 'learn';
    route.topic = m[1] && isTopic(m[1]) ? m[1] : null;
    return true;
  }
  route.view = 'sim';
  route.topic = null;
  return false;
}

export function goLearn(topic: TopicId | null = null) {
  location.hash = topic ? `#learn/${topic}` : '#learn';
}
