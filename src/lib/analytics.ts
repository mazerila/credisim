import type { PostHog } from 'posthog-js';

/**
 * Product analytics (PostHog, EU cloud), same setup as Suncast and Mont Valier.
 * See docs/ANALYTICS.md.
 *
 * - Cookieless: nothing is written to cookies or storage, so no consent banner
 *   is needed. PostHog counts unique visitors per day with a server-side hash.
 * - Every event carries `product = "credisim"`: the "armo products" project is
 *   shared with the other products and each dashboard filters on it.
 * - Only public hosts report; localhost / LAN dev servers stay silent. `?analytics=1`
 *   forces it on for a pipeline test (events flagged `is_test`, excluded from dashboards).
 * - Simulations never reach PostHog: the `#c=…` / `#s=…` fragment and short-link ids
 *   are scrubbed from every URL-like property, and events carry enums and counts only.
 * - posthog-js is loaded on demand, so it does not weigh on the first paint.
 * - The app calls `track(event, props)`; it is a no-op when analytics is off.
 */
export const PRODUCT = 'credisim';

// Public, write-only project token (same project as Suncast and Mont Valier): safe in the bundle.
const TOKEN = 'phc_rDzjyF8BzQGsGhZ7zWqaZUgGfyXWRDMLWx9PPsCMSYhL';
const HOST = 'https://eu.i.posthog.com';

let posthog: PostHog | null = null;
let enabled = false;
const queue: [string, Record<string, unknown>][] = [];

function isLocalHost(hostname: string): boolean {
  return /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)/.test(hostname) || location.protocol === 'file:';
}

/** Remove the simulation from a URL: drop `#c=` / `#s=` fragments, mask `/s/<id>`. Keep `#learn/…`, `#tools/…`. */
export function scrubUrl(v: string): string {
  if (typeof v !== 'string' || !/^https?:|^\//.test(v)) return v;
  return v
    .replace(/#(?:.*[&#])?[cs]=[^#]*$/, '')
    .replace(/\/s\/[A-Za-z0-9]{6,16}(?=[/?#]|$)/, '/s/:id');
}

function scrubProps(props: Record<string, unknown>): Record<string, unknown> {
  for (const k of Object.keys(props)) {
    const v = props[k];
    if (typeof v === 'string') props[k] = scrubUrl(v);
    else if (v && typeof v === 'object' && !Array.isArray(v)) scrubProps(v as Record<string, unknown>);
  }
  return props;
}

/** Leftovers from the Google Analytics period (consent choice, _ga cookies): remove them. */
function cleanUpGoogleAnalytics() {
  try { localStorage.removeItem('credisim.consent'); } catch { /* storage blocked */ }
  for (const c of document.cookie.split(';')) {
    const name = c.split('=')[0].trim();
    if (/^_ga/.test(name)) {
      for (const d of ['', `; domain=${location.hostname}`, `; domain=.${location.hostname}`]) {
        document.cookie = `${name}=; Max-Age=0; path=/${d}`;
      }
    }
  }
}

export function initAnalytics(locale: string): void {
  if (typeof window === 'undefined' || posthog) return;
  cleanUpGoogleAnalytics();
  const forced = new URLSearchParams(location.search).get('analytics') === '1';
  enabled = forced || !isLocalHost(location.hostname);
  if (!enabled) return;

  void import('posthog-js').then(({ default: ph }) => {
    ph.init(TOKEN, {
      api_host: HOST,
      defaults: '2026-05-30',
      cookieless_mode: 'always',
      person_profiles: 'never',
      // Page views are sent by the app on real navigations only: the address bar is
      // rewritten on every edit (replaceState), which must not count as a page view.
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      capture_heatmaps: true,
      // ?analytics=1: log what PostHog does in the console, to test the pipeline.
      debug: forced,
      before_send: (ev) => {
        if (ev?.properties) scrubProps(ev.properties);
        return ev;
      },
    });
    ph.register({ product: PRODUCT, locale, is_test: forced || undefined });
    posthog = ph;
    if (forced) (window as unknown as { __posthog?: PostHog }).__posthog = ph; // pipeline tests
    for (const [e, p] of queue.splice(0)) ph.capture(e, p);
  }).catch(() => { enabled = false; });
}

/** Attach the UI language to every later event. */
export function setAnalyticsLocale(locale: string): void {
  if (posthog) posthog.register({ locale });
}

export function track(event: string, props: Record<string, unknown> = {}): void {
  if (!enabled) return;
  try {
    if (posthog) posthog.capture(event, props);
    else queue.push([event, props]);
  } catch {
    /* analytics must never break the page */
  }
}

/** A page view for the current route (simulator, a tool, an article). */
export function trackPageview(path: string): void {
  track('$pageview', { $current_url: scrubUrl(location.href), route: path });
}
