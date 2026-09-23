import { DEFAULTS, type CreditType, type Inputs } from './engine';
import { i18n, LANGS, type Lang } from './i18n/index.svelte';
import { decodeShare, encodeShare, MAX_SCENARIOS, type Mode } from './share';

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

/** Switch credit type: start from that type's example values, keep the household. */
export function setType(type: CreditType) {
  const c = current();
  const keep = { income: c.income, otherLoans: c.otherLoans, useOtherLoans: c.useOtherLoans, persons: c.persons };
  app.scenarios = [{ ...clone(DEFAULTS[type]), ...keep }];
  app.active = 0;
}

/** New scenario: a copy of the one being edited, 5 years (or 12 months) shorter as a starting point. */
export function addScenario() {
  if (app.scenarios.length >= MAX_SCENARIOS) return;
  const next = clone(current());
  const step = next.type === 'mortgage' ? 60 : 12;
  next.months = next.months - step >= step ? next.months - step : next.months + step;
  app.scenarios = [...app.scenarios, next];
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

export function setTheme(theme: Theme) {
  app.theme = theme;
  const root = document.documentElement;
  if (theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = theme;
  try {
    if (theme === 'system') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
  } catch { /* storage blocked */ }
}

// ---------- share link: the whole simulation lives in the URL fragment ----------
export function toHash(): string {
  return '#' + encodeShare({ scenarios: app.scenarios, mode: app.mode, active: app.active, lang: i18n.lang });
}

/** Apply a shared link. The language from the link is shown but not saved as the visitor's preference. */
export function loadHash(hash = location.hash): boolean {
  const s = decodeShare(hash);
  if (!s) return false;
  app.scenarios = s.scenarios;
  app.mode = s.mode;
  app.active = s.active;
  if (s.lang && (LANGS as string[]).includes(s.lang)) i18n.lang = s.lang as Lang;
  return true;
}
