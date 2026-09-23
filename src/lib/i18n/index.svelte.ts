import { track } from '../analytics';
import { en, type Dict } from './en';
import { fr } from './fr';

export const DICTS = { en, fr } as const;
export type Lang = keyof typeof DICTS;
export const LANGS = Object.keys(DICTS) as Lang[];
export type Key = keyof Dict;

const STORAGE_KEY = 'credisim.lang';
const FR_ZONES = /^(Europe\/(Paris|Monaco)|Indian\/(Reunion|Mayotte)|America\/(Martinique|Guadeloupe|Cayenne|Miquelon)|Pacific\/(Noumea|Tahiti))$/;

/**
 * Language precedence (same as Suncast, plus an IP country hook):
 * ?lang= → saved choice → country from the host (window.__COUNTRY__, set by an edge header) →
 * browser languages → French time zone → English.
 */
function detect(): Lang {
  const isLang = (v: unknown): v is Lang => LANGS.includes(v as Lang);
  const q = new URLSearchParams(location.search).get('lang');
  if (isLang(q)) return q;
  try { const s = localStorage.getItem(STORAGE_KEY); if (isLang(s)) return s; } catch { /* storage blocked */ }
  const country = (window as { __COUNTRY__?: string }).__COUNTRY__;
  if (country) return ['FR', 'BE', 'LU', 'MC', 'CH'].includes(country.toUpperCase()) ? 'fr' : 'en';
  for (const l of navigator.languages ?? [navigator.language]) {
    const c = l.slice(0, 2).toLowerCase();
    if (isLang(c)) return c;
  }
  try { if (FR_ZONES.test(Intl.DateTimeFormat().resolvedOptions().timeZone)) return 'fr'; } catch { /* old browser */ }
  return 'en';
}

export const i18n = $state({ lang: detect() });

export function setLang(l: Lang) {
  if (l !== i18n.lang) track('language_changed', { from: i18n.lang, to: l });
  i18n.lang = l;
  try { localStorage.setItem(STORAGE_KEY, l); } catch { /* storage blocked */ }
}

export function t(key: Key, vars?: Record<string, string | number>): string {
  const s = DICTS[i18n.lang][key] ?? en[key] ?? key;
  return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s;
}

const locale = () => (i18n.lang === 'fr' ? 'fr-FR' : 'en-IE');

export const fmt = {
  eur: (v: number, digits = 0) =>
    new Intl.NumberFormat(locale(), { style: 'currency', currency: 'EUR', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v),
  pct: (v: number, digits = 2) =>
    new Intl.NumberFormat(locale(), { style: 'percent', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v),
  compact: (v: number) => new Intl.NumberFormat(locale(), { notation: 'compact', maximumFractionDigits: 1 }).format(v),
  num: (v: number, digits = 0) => new Intl.NumberFormat(locale(), { maximumFractionDigits: digits }).format(v),
  duration: (months: number, unit: 'years' | 'months') =>
    unit === 'years'
      ? t('years', { n: new Intl.NumberFormat(locale(), { maximumFractionDigits: 2 }).format(months / 12) })
      : t('months', { n: months }),
  years: (months: number) => t('years', { n: new Intl.NumberFormat(locale(), { maximumFractionDigits: 1 }).format(months / 12) }),
};
