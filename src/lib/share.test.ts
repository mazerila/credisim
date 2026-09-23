import { describe, expect, it } from 'vitest';
import { DEFAULTS, type Inputs } from './engine';
import { decodePayload, decodeShare, encodeFullPayload, encodeLegacyShare, encodeShare, sanitizeInputs } from './share';

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
  rateType: 'capped', indexRate: 2.8, margin: 1.1, cap: 2, scenario: 'up2',
};
const list = [custom, { ...custom, months: 240, rate: 3.1 }, { ...custom, rate: 2.9 }, { ...custom, downPayment: 90000 }];

describe('share links', () => {
  it('restores every field of 4 scenarios, the mode, the active tab and the language', async () => {
    const s = (await decodeShare('#' + (await encodeShare({ scenarios: list, mode: 'expert', active: 3, lang: 'fr' }))))!;
    expect(s.scenarios).toEqual(list);
    expect(s).toMatchObject({ mode: 'expert', active: 3, lang: 'fr' });
  });

  it('keeps the address-bar link short (only changed fields, compressed)', async () => {
    const one = { scenarios: [{ ...DEFAULTS.mortgage, price: 350000, rate: 3.4 }], mode: 'quick' as const, active: 0, lang: 'fr' };
    const hash = await encodeShare(one);
    expect(hash.startsWith('c=')).toBe(true);
    expect(hash.length).toBeLessThan(120);
    expect(hash.length).toBeLessThan(encodeLegacyShare(one).length / 10);
  });

  it('stores full payloads for short links', async () => {
    const payload = await encodeFullPayload({ scenarios: [custom], mode: 'expert', active: 0 });
    expect((await decodePayload(payload))!.scenarios[0]).toEqual(custom);
  });

  it('works for every credit type', async () => {
    for (const type of ['personal', 'car', 'works'] as const) {
      const a = { ...DEFAULTS[type], rate: 7.25, months: 42, useFileFee: true, fileFee: 99 };
      expect((await decodeShare(await encodeShare({ scenarios: [a], mode: 'quick', active: 0 })))!.scenarios[0]).toEqual(a);
    }
  });

  it('ignores malformed links and bad values', async () => {
    expect(await decodeShare('#s=not-base64!!')).toBeNull();
    expect(await decodeShare('#c=zzzz')).toBeNull();
    expect(await decodeShare('#other=1')).toBeNull();
    const bad = sanitizeInputs({ type: 'mortgage', rate: 'high', months: Infinity, guarantee: 'magic', price: 250000 })!;
    expect(bad.rate).toBe(DEFAULTS.mortgage.rate);
    expect(bad.months).toBe(DEFAULTS.mortgage.months);
    expect(bad.guarantee).toBe(DEFAULTS.mortgage.guarantee);
    expect(bad.price).toBe(250000);
    expect(sanitizeInputs({ type: 'yacht' })).toBeNull();
  });

  it('still opens v2 links (#s=, full JSON)', async () => {
    const s = (await decodeShare('#' + encodeLegacyShare({ scenarios: list, mode: 'expert', active: 1, lang: 'en' })))!;
    expect(s.scenarios).toEqual(list);
    expect(s).toMatchObject({ active: 1, lang: 'en' });
  });

  it('still opens v1 links with scenarios A and B', async () => {
    const enc = (o: unknown) => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const s = (await decodeShare('#s=' + enc({ v: 1, a: { type: 'car', price: 20000 }, b: { type: 'car', months: 48 }, m: 'q', t: 'b' })))!;
    expect(s.scenarios.map((x) => x.type)).toEqual(['car', 'car']);
    expect(s.scenarios[1].months).toBe(48);
    expect(s.active).toBe(1);
  });

  it('drops scenarios of another credit type and keeps at most four', async () => {
    const mixed = [DEFAULTS.personal, DEFAULTS.car, DEFAULTS.personal, DEFAULTS.personal, DEFAULTS.personal, DEFAULTS.personal];
    const s = (await decodeShare(await encodeShare({ scenarios: mixed, mode: 'quick', active: 0 })))!;
    expect(s.scenarios).toHaveLength(4);
    expect(new Set(s.scenarios.map((x) => x.type))).toEqual(new Set(['personal']));
  });
});
