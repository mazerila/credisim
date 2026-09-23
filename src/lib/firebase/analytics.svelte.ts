import type { Analytics } from 'firebase/analytics';
import { firebaseConfig } from './config';

/**
 * Google Analytics (via Firebase) runs only after the visitor agrees (CNIL rules),
 * only on the production build, and never receives simulation figures: only page
 * views and which features are used.
 */
export type Consent = 'granted' | 'denied' | null;

const KEY = 'credisim.consent';

function readConsent(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export const consent = $state<{ value: Consent; open: boolean }>({ value: readConsent(), open: false });

let analytics: Analytics | null = null;
let loading: Promise<Analytics | null> | null = null;
const queue: [string, Record<string, unknown>][] = [];

const enabled = () => import.meta.env.PROD && consent.value === 'granted';

async function load(): Promise<Analytics | null> {
  if (analytics) return analytics;
  if (!loading) {
    loading = (async () => {
      const [{ initializeApp }, a] = await Promise.all([import('firebase/app'), import('firebase/analytics')]);
      if (!(await a.isSupported())) return null;
      analytics = a.getAnalytics(initializeApp(firebaseConfig));
      for (const [name, params] of queue.splice(0)) a.logEvent(analytics, name, params);
      return analytics;
    })().catch(() => null);
  }
  return loading;
}

export function setConsent(v: 'granted' | 'denied') {
  consent.value = v;
  consent.open = false;
  try { localStorage.setItem(KEY, v); } catch { /* storage blocked */ }
  if (v === 'granted') void load();
  else if (analytics) void import('firebase/analytics').then((a) => a.setAnalyticsCollectionEnabled(analytics!, false));
}

/** Record an event (no personal or financial data). Dropped unless the visitor agreed. */
export function track(name: string, params: Record<string, unknown> = {}) {
  if (!enabled()) return;
  if (analytics) void import('firebase/analytics').then((a) => a.logEvent(analytics!, name, params));
  else {
    queue.push([name, params]);
    void load();
  }
}

export function startAnalytics() {
  if (enabled()) void load();
}
