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
  amortization: 'linear', deferralType: 'partial', deferralMonths: 18, borrowers: 2, insuranceRate2: 0.22, insuranceCover2: 50,
  usePtz: true, ptzZone: 'B2', ptzKind: 'oldWithWorks', persons: 4, taxIncome: 61000, ptzAuto: false, ptzAmount: 35000, smoothing: false,
};

describe('share links', () => {
  it('restores every field of both scenarios, the mode, the active tab and the language', () => {
    const list = [custom, { ...custom, months: 240, rate: 3.1 }, { ...custom, rate: 2.9 }, { ...custom, downPayment: 90000 }];
    const hash = '#' + encodeShare({ scenarios: list, mode: 'expert', active: 3, lang: 'fr' });
    const s = decodeShare(hash)!;
    expect(s.scenarios).toEqual(list);
    expect(s).toMatchObject({ mode: 'expert', active: 3, lang: 'fr' });
  });

  it('works for every credit type', () => {
    for (const type of ['personal', 'car', 'works'] as const) {
      const a = { ...DEFAULTS[type], rate: 7.25, months: 42, useFileFee: true, fileFee: 99 };
      expect(decodeShare(encodeShare({ scenarios: [a], mode: 'quick', active: 0 }))!.scenarios[0]).toEqual(a);
    }
  });

  it('keeps accents and special characters intact', () => {
    const s = decodeShare(encodeShare({ scenarios: [custom], mode: 'quick', active: 0, lang: 'fr' }));
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
    expect(s.scenarios[0].months).toBe(240);
    expect(s.scenarios[0].price).toBe(DEFAULTS.mortgage.price);
    expect(s.mode).toBe('expert');
  });

  it('opens version-1 links with scenarios A and B', () => {
    const enc = (o: unknown) => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const s = decodeShare('#s=' + enc({ v: 1, a: { type: 'car', price: 20000 }, b: { type: 'car', months: 48 }, m: 'q', t: 'b' }))!;
    expect(s.scenarios.map((x) => x.type)).toEqual(['car', 'car']);
    expect(s.scenarios[1].months).toBe(48);
    expect(s.active).toBe(1);
  });

  it('drops scenarios of another credit type and keeps at most four', () => {
    const list = [DEFAULTS.personal, DEFAULTS.car, DEFAULTS.personal, DEFAULTS.personal, DEFAULTS.personal, DEFAULTS.personal];
    const s = decodeShare(encodeShare({ scenarios: list, mode: 'quick', active: 0 }))!;
    expect(s.scenarios).toHaveLength(4);
    expect(new Set(s.scenarios.map((x) => x.type))).toEqual(new Set(['personal']));
  });
});
