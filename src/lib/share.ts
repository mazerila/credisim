import { DEFAULTS, type CreditType, type Inputs } from './engine';

/**
 * Share links carry the whole simulation in the URL fragment (#s=…), so nothing is
 * sent to a server. Every field is written out in full (not as a diff from defaults),
 * so a link keeps the same values even if the app's example values change later.
 */

export type Mode = 'quick' | 'expert';

export const MAX_SCENARIOS = 4;
export const SCENARIO_NAMES = ['A', 'B', 'C', 'D'];

export interface ShareState {
  /** 1 to 4 scenarios of the same credit type */
  scenarios: Inputs[];
  mode: Mode;
  /** index of the scenario being edited */
  active: number;
  lang?: string;
}

const VERSION = 2;

/** Allowed values for every text field; anything else in a link is ignored. */
const ENUMS: Partial<Record<keyof Inputs, readonly string[]>> = {
  type: ['mortgage', 'personal', 'car', 'works'],
  propertyKind: ['old', 'new'],
  transferTaxZone: ['raised', 'standard', 'indre'],
  insuranceBase: ['initial', 'remaining'],
  guarantee: ['caution', 'hypo', 'ppd'],
  amortization: ['annuity', 'linear', 'inFine'],
  deferralType: ['none', 'partial', 'total'],
  ptzZone: ['A', 'B1', 'B2', 'C'],
  ptzKind: ['newFlat', 'newHouse', 'oldWithWorks'],
  rateType: ['fixed', 'variable', 'capped'],
  scenario: ['down1', 'stable', 'up1', 'up2', 'up3'],
};

const b64 = {
  enc: (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
  dec: (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))),
};

/** Rebuild valid Inputs from untrusted data: start from the type's defaults, keep only well-typed values. */
export function sanitizeInputs(raw: unknown): Inputs | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const type = r.type as CreditType;
  if (!ENUMS.type!.includes(type)) return null;
  const out = { ...DEFAULTS[type] } as Record<string, unknown>;
  for (const [k, def] of Object.entries(DEFAULTS[type])) {
    const v = r[k];
    if (v === undefined || typeof v !== typeof def) continue;
    if (typeof v === 'number' && !Number.isFinite(v)) continue;
    const allowed = ENUMS[k as keyof Inputs];
    if (allowed && !allowed.includes(v as string)) continue;
    out[k] = v;
  }
  return out as unknown as Inputs;
}

export function encodeShare(s: ShareState): string {
  const payload: Record<string, unknown> = { v: VERSION, s: s.scenarios, m: s.mode === 'expert' ? 'e' : 'q', t: s.active };
  if (s.lang) payload.l = s.lang;
  return 's=' + b64.enc(JSON.stringify(payload));
}

/** Read a fragment like "#s=…"; null if there is none or it is malformed. Accepts v1 links (a/b). */
export function decodeShare(hash: string): ShareState | null {
  const m = hash.match(/[#&]?s=([\w-]+)/);
  if (!m) return null;
  try {
    const p = JSON.parse(b64.dec(m[1]));
    const raw: unknown[] = Array.isArray(p.s) ? p.s : [p.a, p.b];
    const list = raw.map(sanitizeInputs).filter((x): x is Inputs => !!x);
    if (!list.length) return null;
    // Scenarios compare the same kind of credit.
    const scenarios = list.filter((x) => x.type === list[0].type).slice(0, MAX_SCENARIOS);
    const t = p.t === 'b' ? 1 : typeof p.t === 'number' ? p.t : 0;
    return {
      scenarios,
      mode: p.m === 'e' ? 'expert' : 'quick',
      active: t >= 0 && t < scenarios.length ? t : 0,
      lang: typeof p.l === 'string' ? p.l : undefined,
    };
  } catch {
    return null;
  }
}
