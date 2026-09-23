import { DEFAULTS, type CreditType, type Inputs } from './engine';

/**
 * Share links carry the whole simulation in the URL fragment (#s=…), so nothing is
 * sent to a server. Every field is written out in full (not as a diff from defaults),
 * so a link keeps the same values even if the app's example values change later.
 */

export type Mode = 'quick' | 'expert';
export type ScenarioId = 'a' | 'b';

export interface ShareState {
  a: Inputs;
  b: Inputs | null;
  mode: Mode;
  active: ScenarioId;
  lang?: string;
}

const VERSION = 1;

/** Allowed values for every text field; anything else in a link is ignored. */
const ENUMS: Partial<Record<keyof Inputs, readonly string[]>> = {
  type: ['mortgage', 'personal', 'car', 'works'],
  propertyKind: ['old', 'new'],
  transferTaxZone: ['raised', 'standard', 'indre'],
  insuranceBase: ['initial', 'remaining'],
  guarantee: ['caution', 'hypo', 'ppd'],
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
  const payload: Record<string, unknown> = { v: VERSION, a: s.a, m: s.mode === 'expert' ? 'e' : 'q', t: s.active };
  if (s.b) payload.b = s.b;
  if (s.lang) payload.l = s.lang;
  return 's=' + b64.enc(JSON.stringify(payload));
}

/** Read a fragment like "#s=…"; null if there is none or it is malformed. */
export function decodeShare(hash: string): ShareState | null {
  const m = hash.match(/[#&]?s=([\w-]+)/);
  if (!m) return null;
  try {
    const p = JSON.parse(b64.dec(m[1]));
    const a = sanitizeInputs(p.a);
    if (!a) return null;
    let b = sanitizeInputs(p.b);
    // Scenario B compares the same kind of credit.
    if (b && b.type !== a.type) b = null;
    return {
      a,
      b,
      mode: p.m === 'e' ? 'expert' : 'quick',
      active: p.t === 'b' && b ? 'b' : 'a',
      lang: typeof p.l === 'string' ? p.l : undefined,
    };
  } catch {
    return null;
  }
}
