import { decode, encode } from '@credisim/shortlink';
import { DEFAULTS, type CreditType, type Inputs } from './engine';

/**
 * The simulation travels in the URL fragment, compressed:
 *   #c=<payload>  current format: only the fields that differ from the example values, deflated
 *   #s=<base64>   older links (v1/v2): full JSON, still readable
 * Short links (/s/<id>) store a payload in full (every field), so they keep the same values
 * even if the app's example values change later.
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

const VERSION = 3;

/** Allowed values for every text field; anything else in a link is ignored. */
const ENUMS: Partial<Record<keyof Inputs, readonly string[]>> = {
  type: ['mortgage', 'personal', 'car', 'works'],
  propertyKind: ['old', 'new'],
  transferTaxZone: ['raised', 'standard', 'indre'],
  insuranceBase: ['initial', 'remaining'],
  guarantee: ['caution', 'hypo', 'ppd', 'mortgage', 'grundschuld', 'valuation', 'ipoteca', 'nhg', 'none'],
  country: ['FR', 'BE', 'DE', 'ES', 'IT', 'NL'],
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

function diff(i: Inputs): Record<string, unknown> {
  const d = DEFAULTS[i.type] as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = { type: i.type };
  for (const [k, v] of Object.entries(i)) if (v !== d[k]) out[k] = v;
  return out;
}

function payloadOf(s: ShareState, full: boolean): Record<string, unknown> {
  const p: Record<string, unknown> = { v: VERSION, s: full ? s.scenarios : s.scenarios.map(diff), m: s.mode === 'expert' ? 'e' : 'q', t: s.active };
  if (s.lang) p.l = s.lang;
  return p;
}

/** Compact payload for the address bar: `c=…` (only the changed fields). */
export async function encodeShare(s: ShareState): Promise<string> {
  return 'c=' + (await encode(payloadOf(s, false)));
}

/** Self-contained payload for a stored short link (every field). */
export async function encodeFullPayload(s: ShareState): Promise<string> {
  return encode(payloadOf(s, true));
}

function fromPayload(p: Record<string, unknown>): ShareState | null {
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
}

/** Decode a stored or compact payload (the part after `c=`). */
export async function decodePayload(payload: string): Promise<ShareState | null> {
  try {
    return fromPayload(await decode<Record<string, unknown>>(payload));
  } catch {
    return null;
  }
}

/** Read a fragment: "#c=…" (current) or "#s=…" (v1/v2 links). Null if none or malformed. */
export async function decodeShare(hash: string): Promise<ShareState | null> {
  const c = hash.match(/[#&]?c=([\w-]+)/);
  if (c) return decodePayload(c[1]);
  const m = hash.match(/[#&]?s=([\w-]+)/);
  if (!m) return null;
  try {
    return fromPayload(JSON.parse(b64.dec(m[1])));
  } catch {
    return null;
  }
}

/** Build an old-style v2 fragment (tests and backward compatibility only). */
export function encodeLegacyShare(s: ShareState): string {
  return 's=' + b64.enc(JSON.stringify({ ...payloadOf(s, true), v: 2 }));
}
