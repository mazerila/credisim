import { COUNTRIES, countryDefaults, DEFAULTS, isCountry, type Country, type CreditType, type Inputs } from './engine';
import { i18n, LANGS, type Lang } from './i18n/index.svelte';
import { decodeShare, encodeFullPayload, encodeShare, MAX_SCENARIOS, type Mode, type ShareState } from './share';
import { track } from './analytics';

export type { Mode };
export type Theme = 'system' | 'light' | 'dark';

interface AppState {
  mode: Mode;
  theme: Theme;
  /** index of the scenario being edited */
  active: number;
  /** 1 to 4 scenarios, all of the same credit type */
  scenarios: Inputs[];
}

const clone = (i: Inputs): Inputs => ({ ...i });

export const app = $state<AppState>({
  mode: 'quick',
  theme: 'system',
  active: 0,
  scenarios: [clone(DEFAULTS.mortgage)],
});

export function current(): Inputs {
  return app.scenarios[app.active] ?? app.scenarios[0];
}

/** Switch credit type: start from that type's example values, keep the household and country. */
export function setType(type: CreditType) {
  const c = current();
  const keep = { income: c.income, otherLoans: c.otherLoans, useOtherLoans: c.useOtherLoans, persons: c.persons };
  const fresh = { ...clone(DEFAULTS[type]), ...keep };
  app.scenarios = [c.country === 'FR' ? fresh : { ...fresh, ...countryPreset(c.country, type) }];
  track('credit_type_selected', { credit_type: type });
  app.active = 0;
}

function countryPreset(country: Country, type: CreditType): Partial<Inputs> {
  const d = countryDefaults(country);
  // Consumer loans keep their own rates; only home loans take the country's mortgage rate.
  return type === 'mortgage' ? d : { country, region: d.region, useInsurance: false };
}

/** Switch country for every scenario: its costs, typical rate and guarantee; amounts stay. */
export function setCountry(country: Country) {
  app.scenarios = app.scenarios.map((s) => ({ ...s, ...countryPreset(country, s.type) }));
  track('country_changed', { to: country });
}

/** First visit: pick the country from ?country=, the time zone, then the language. */
export function detectCountry(lang: string) {
  const q = new URLSearchParams(location.search).get('country')?.toUpperCase();
  let c: Country = 'FR';
  if (isCountry(q)) c = q;
  else {
    let tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { /* old browser */ }
    const byZone: Record<string, Country> = { 'Europe/Brussels': 'BE', 'Europe/Berlin': 'DE', 'Europe/Madrid': 'ES', 'Europe/Rome': 'IT', 'Europe/Amsterdam': 'NL' };
    const byLang: Record<string, Country> = { de: 'DE', es: 'ES', it: 'IT', nl: 'NL' };
    c = byZone[tz] ?? byLang[lang] ?? 'FR';
  }
  if (c !== 'FR' && COUNTRIES[c]) app.scenarios = app.scenarios.map((s) => ({ ...s, ...countryPreset(c, s.type) }));
}

/** New scenario: a copy of the one being edited, 5 years (or 12 months) shorter as a starting point. */
export function addScenario() {
  if (app.scenarios.length >= MAX_SCENARIOS) return;
  const next = clone(current());
  const step = next.type === 'mortgage' ? 60 : 12;
  next.months = next.months - step >= step ? next.months - step : next.months + step;
  app.scenarios = [...app.scenarios, next];
  track('scenario_added', { count: app.scenarios.length });
  app.active = app.scenarios.length - 1;
}

export function removeScenario(index = app.active) {
  if (app.scenarios.length <= 1) return;
  app.scenarios = app.scenarios.filter((_, i) => i !== index);
  app.active = Math.min(app.active, app.scenarios.length - 1);
}

// ---------- theme ----------
const THEME_KEY = 'credisim.theme';
try {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') app.theme = saved;
} catch { /* storage blocked */ }

export function setTheme(theme: Theme, user = false) {
  if (user && theme !== app.theme) track('theme_changed', { from: app.theme, to: theme });
  app.theme = theme;
  const root = document.documentElement;
  if (theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = theme;
  try {
    if (theme === 'system') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
  } catch { /* storage blocked */ }
}

// ---------- share link: the simulation lives in the URL fragment (compressed) ----------
function shareState() {
  return { scenarios: app.scenarios, mode: app.mode, active: app.active, lang: i18n.lang };
}

export async function toHash(): Promise<string> {
  return '#' + (await encodeShare(shareState()));
}

/** Full payload for a stored short link. */
export function toFullPayload(): Promise<string> {
  return encodeFullPayload(shareState());
}

/** Apply a decoded state. The language from a link is shown but not saved as the visitor's preference. */
export function applyShared(s: ShareState) {
  app.scenarios = s.scenarios;
  app.mode = s.mode;
  app.active = s.active;
  if (s.lang && (LANGS as string[]).includes(s.lang)) i18n.lang = s.lang as Lang;
}

export async function loadHash(hash = location.hash): Promise<boolean> {
  const s = await decodeShare(hash);
  if (!s) return false;
  applyShared(s);
  return true;
}
