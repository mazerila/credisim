import { describe, expect, it } from 'vitest';
import { DEFAULTS, type Inputs } from './engine';
import { decodeShare, encodeShare, sanitizeInputs } from './share';

const custom: Inputs = {
  ...DEFAULTS.mortgage,
  price: 412500, downPayment: 61000, propertyKind: 'new', firstTimeBuyer: true, transferTaxZone: 'standard',
  notaryAuto: false, notaryPct: 2.6, works: 22000, useWorks: true,
  rate: 3.35, months: 270,
  useInsurance: true, insuranceRate: 0.18, insuranceBase: 'remaining', insuranceCover: 200,
  useGuarantee: true, guarantee: 'hypo', guaranteeAuto: false, guaranteeAmount: 3900,
  useFileFee: true, fileFee: 750, useBrokerFee: true, brokerFee: 1800,
  useOtherLoans: true, otherLoans: 240, income: 7300,
};

describe('share links', () => {
  it('restores every field of both scenarios, the mode, the active tab and the language', () => {
    const b = { ...custom, months: 240, rate: 3.1 };
    const hash = '#' + encodeShare({ a: custom, b, mode: 'expert', active: 'b', lang: 'fr' });
    const s = decodeShare(hash)!;
    expect(s.a).toEqual(custom);
    expect(s.b).toEqual(b);
    expect(s).toMatchObject({ mode: 'expert', active: 'b', lang: 'fr' });
  });

  it('works for every credit type', () => {
    for (const type of ['personal', 'car', 'works'] as const) {
      const a = { ...DEFAULTS[type], rate: 7.25, months: 42, useFileFee: true, fileFee: 99 };
      expect(decodeShare(encodeShare({ a, b: null, mode: 'quick', active: 'a' }))!.a).toEqual(a);
    }
  });

  it('keeps accents and special characters intact', () => {
    const s = decodeShare(encodeShare({ a: custom, b: null, mode: 'quick', active: 'a', lang: 'fr' }));
    expect(s?.lang).toBe('fr');
  });

  it('ignores malformed links and bad values', () => {
    expect(decodeShare('#s=not-base64!!')).toBeNull();
    expect(decodeShare('#other=1')).toBeNull();
    const bad = sanitizeInputs({ type: 'mortgage', rate: 'high', months: Infinity, guarantee: 'magic', price: 250000 })!;
    expect(bad.rate).toBe(DEFAULTS.mortgage.rate);
    expect(bad.months).toBe(DEFAULTS.mortgage.months);
    expect(bad.guarantee).toBe(DEFAULTS.mortgage.guarantee);
    expect(bad.price).toBe(250000);
    expect(sanitizeInputs({ type: 'yacht' })).toBeNull();
  });

  it('still opens links made before full encoding (only changed fields)', () => {
    const old = '#s=' + btoa(JSON.stringify({ a: { type: 'mortgage', months: 240 }, m: 'e' })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const s = decodeShare(old)!;
    expect(s.a.months).toBe(240);
    expect(s.a.price).toBe(DEFAULTS.mortgage.price);
    expect(s.mode).toBe('expert');
  });
});
