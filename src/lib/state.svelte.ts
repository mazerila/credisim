import { DEFAULTS, type CreditType, type Inputs } from './engine';
import { i18n, LANGS, type Lang } from './i18n/index.svelte';
import { decodeShare, encodeShare, type Mode, type ScenarioId } from './share';

export type { Mode, ScenarioId };
export type Theme = 'system' | 'light' | 'dark';

interface AppState {
  mode: Mode;
  theme: Theme;
  active: ScenarioId;
  a: Inputs;
  b: Inputs | null;
}

const clone = (i: Inputs): Inputs => ({ ...i });

export const app = $state<AppState>({
  mode: 'quick',
  theme: 'system',
  active: 'a',
  a: clone(DEFAULTS.mortgage),
  b: null,
});

export function current(): Inputs {
  return (app.active === 'b' && app.b) || app.a;
}

/** Switch credit type: start from that type's example values, keep the household. */
export function setType(type: CreditType) {
  const keep = { income: current().income, otherLoans: current().otherLoans, useOtherLoans: current().useOtherLoans };
  const next = { ...clone(DEFAULTS[type]), ...keep };
  app.a = next;
  app.b = null;
  app.active = 'a';
}

export function addScenarioB() {
  const b = clone(app.a);
  b.months = Math.max(b.months - (b.type === 'mortgage' ? 60 : 12), b.type === 'mortgage' ? 60 : 12);
  app.b = b;
  app.active = 'b';
}

export function removeScenarioB() {
  app.b = null;
  app.active = 'a';
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
  return '#' + encodeShare({ a: app.a, b: app.b, mode: app.mode, active: app.active, lang: i18n.lang });
}

/** Apply a shared link. The language from the link is shown but not saved as the visitor's preference. */
export function loadHash(hash = location.hash): boolean {
  const s = decodeShare(hash);
  if (!s) return false;
  app.a = s.a;
  app.b = s.b;
  app.mode = s.mode;
  app.active = s.active;
  if (s.lang && (LANGS as string[]).includes(s.lang)) i18n.lang = s.lang as Lang;
  return true;
}
