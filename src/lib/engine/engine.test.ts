import { describe, expect, it } from 'vitest';
import {
  actuarialRate, borrowingCapacity, DEFAULTS, monthlyPayment, monthsFromPayment, nominalToActuarial,
  notaryEmoluments, notaryFees, principalFromPayment, principalOf, rateFromPayment, schedule, simulate,
  usuryCategory, usuryTable,
} from './index';

const TODAY = new Date('2026-09-22');

describe('monthly payment', () => {
  it('matches the textbook case: €100k, 3 %, 20 years → €554.60', () => {
    expect(monthlyPayment(100000, 0.03, 240)).toBeCloseTo(554.6, 2);
  });
  it('divides evenly at 0 %', () => {
    expect(monthlyPayment(12000, 0, 24)).toBe(500);
  });
  it('gives €233.71 for €10,000 over 48 months at 5.75 %', () => {
    expect(Math.round(monthlyPayment(10000, 0.0575, 48) * 100) / 100).toBe(233.71);
  });
});

describe('schedule', () => {
  const rows = schedule(250000, 0.032, 300, { rate: 0.003, base: 'initial', cover: 1 });
  it('repays exactly the principal and ends at zero', () => {
    const capital = rows.reduce((s, r) => s + r.capital, 0);
    expect(capital).toBeCloseTo(250000, 2);
    expect(rows.at(-1)!.balance).toBe(0);
  });
  it('keeps insurance constant on initial capital', () => {
    expect(new Set(rows.map((r) => r.insurance)).size).toBe(1);
    expect(rows[0].insurance).toBeCloseTo(62.5, 2);
  });
  it('makes insurance decline on remaining capital', () => {
    const crd = schedule(250000, 0.032, 300, { rate: 0.003, base: 'remaining', cover: 1 });
    expect(crd[0].insurance).toBeGreaterThan(crd[200].insurance);
    expect(crd.reduce((s, r) => s + r.insurance, 0)).toBeLessThan(rows.reduce((s, r) => s + r.insurance, 0));
  });
});

describe('solvers', () => {
  it('principalFromPayment is the inverse of monthlyPayment', () => {
    const p = monthlyPayment(180000, 0.035, 240);
    expect(principalFromPayment(p, 0.035, 240)).toBeCloseTo(180000, 4);
  });
  it('finds the duration for a payment', () => {
    const p = monthlyPayment(180000, 0.035, 240);
    expect(monthsFromPayment(180000, 0.035, p)).toBe(240);
    expect(monthsFromPayment(180000, 0.035, 100)).toBe(Infinity);
  });
  it('finds the rate for a payment', () => {
    const p = monthlyPayment(180000, 0.035, 240);
    expect(rateFromPayment(180000, 240, p)).toBeCloseTo(0.035, 8);
  });
});

describe('TAEG', () => {
  it('equals the actuarial nominal rate without fees: 5.75 % → 5.90 %', () => {
    const flows = Array(48).fill(monthlyPayment(10000, 0.0575, 48));
    expect(actuarialRate(10000, flows)).toBeCloseTo(0.059, 4);
    expect(nominalToActuarial(0.0575)).toBeCloseTo(0.059, 4);
  });
  it('rises with upfront fees and discounts flows back to the net amount', () => {
    const flows = Array(240).fill(monthlyPayment(200000, 0.03, 240));
    const t = actuarialRate(198000, flows);
    expect(t).toBeGreaterThan(nominalToActuarial(0.03));
    const i = Math.pow(1 + t, 1 / 12) - 1;
    const pv = flows.reduce((s, f, k) => s + f / Math.pow(1 + i, k + 1), 0);
    expect(pv).toBeCloseTo(198000, 2);
  });
  it('is 0 for a zero-rate loan without fees', () => {
    expect(actuarialRate(12000, Array(24).fill(500))).toBe(0);
  });
});

describe('rules', () => {
  it('picks the Q3 2026 usury table and flags it stale after 30 Sept', () => {
    expect(usuryTable(TODAY)).toMatchObject({ stale: false, table: { quarter: '2026-Q3' } });
    expect(usuryTable(new Date('2026-10-02')).stale).toBe(true);
  });
  it('uses duration bands for mortgages and amount bands for consumer loans', () => {
    expect(usuryCategory('mortgage', 200000, 119)).toBe('fixedUnder10y');
    expect(usuryCategory('mortgage', 200000, 180)).toBe('fixed10to20y');
    expect(usuryCategory('mortgage', 200000, 300)).toBe('fixed20yPlus');
    expect(usuryCategory('personal', 2500, 24)).toBe('upTo3000');
    expect(usuryCategory('car', 5000, 24)).toBe('upTo6000');
    expect(usuryCategory('personal', 15000, 60)).toBe('above6000');
    expect(usuryCategory('works', 80000, 120)).toBe('fixed10to20y');
  });
  it('computes the notary emolument scale', () => {
    // 6,500×3.870 % + 10,500×1.596 % + 43,000×1.064 % + 260,000×0.799 %
    expect(notaryEmoluments(320000)).toBeCloseTo(251.55 + 167.58 + 457.52 + 2077.4, 1);
  });
  it('lands notary fees in the usual ranges', () => {
    const old = notaryFees(320000, 'old', 'raised', false) / 320000;
    const first = notaryFees(320000, 'old', 'raised', true) / 320000;
    const neu = notaryFees(320000, 'new', 'raised', false) / 320000;
    expect(old).toBeGreaterThan(0.07); expect(old).toBeLessThan(0.085);
    expect(first).toBeLessThan(old);
    expect(neu).toBeGreaterThan(0.02); expect(neu).toBeLessThan(0.03);
  });
});

describe('simulate', () => {
  it('builds the mortgage example consistently', () => {
    const i = DEFAULTS.mortgage;
    const r = simulate(i, TODAY);
    const { principal, notary, guarantee, fees } = principalOf(i);
    expect(r.principal).toBe(principal);
    expect(principal).toBeCloseTo(i.price + notary + fees + guarantee - i.downPayment, -1);
    expect(r.taeg).toBeGreaterThan(nominalToActuarial(0.032));
    expect(r.taeg).toBeCloseTo(r.taegParts.interest + r.taegParts.insurance + r.taegParts.fees, 10);
    expect(r.usury.ok).toBe(true);
    expect(r.duration?.ok).toBe(true);
    expect(r.debtRatio!.value).toBeCloseTo(r.monthlyTotal / i.income, 10);
  });
  it('drops each component when it is switched off', () => {
    const all = simulate(DEFAULTS.mortgage, TODAY);
    const bare = simulate({ ...DEFAULTS.mortgage, useInsurance: false, useGuarantee: false, useFileFee: false, useNotary: false }, TODAY);
    expect(bare.totalInsurance).toBe(0);
    expect(bare.guarantee).toBe(0);
    expect(bare.fees).toBe(0);
    expect(bare.notary).toBe(0);
    expect(bare.principal).toBe(DEFAULTS.mortgage.price - DEFAULTS.mortgage.downPayment);
    expect(bare.taeg).toBeCloseTo(nominalToActuarial(0.032), 6);
    expect(bare.creditCost).toBeLessThan(all.creditCost);
  });
  it('uses a manual guarantee amount when not estimated', () => {
    const i = { ...DEFAULTS.mortgage, guaranteeAuto: false, guaranteeAmount: 4000 };
    const r = simulate(i, TODAY);
    const auto = simulate(DEFAULTS.mortgage, TODAY);
    expect(r.guarantee).toBe(4000);
    expect(r.principal).toBe(Math.round(auto.principal - auto.guarantee + 4000));
    expect(r.taegParts.fees).toBeGreaterThan(auto.taegParts.fees);
  });
  it('simulates a home loan from the amount only', () => {
    const i = { ...DEFAULTS.mortgage, amountOnly: true, amount: 180000 };
    const r = simulate(i, TODAY);
    expect(r.principal).toBe(180000);
    expect(r.notary).toBe(0);
    expect(r.works).toBe(0);
    expect(r.guarantee).toBeCloseTo(180000 * 0.0075 + 300, 6);
    expect(r.usury.category).toBe('fixed20yPlus');
    expect(r.taeg).toBeGreaterThan(r.taegParts.interest);
    const manual = simulate({ ...i, guaranteeAuto: false, guaranteeAmount: 2000 }, TODAY);
    expect(manual.guarantee).toBe(2000);
    expect(manual.principal).toBe(180000);
  });
  it('flags a mortgage over 25 years and a TAEG over the usury rate', () => {
    const r = simulate({ ...DEFAULTS.mortgage, months: 360, rate: 5.5 }, TODAY);
    expect(r.duration?.ok).toBe(false);
    expect(r.usury.ok).toBe(false);
  });
  it('treats a personal loan as consumer credit with upfront fees', () => {
    const i = { ...DEFAULTS.personal, useFileFee: true };
    const r = simulate(i, TODAY);
    expect(r.principal).toBe(i.amount);
    expect(r.usury.category).toBe('above6000');
    expect(r.duration).toBeNull();
    expect(r.taeg).toBeGreaterThan(nominalToActuarial(i.rate / 100));
  });
  it('finances a car as price minus down payment', () => {
    const r = simulate(DEFAULTS.car, TODAY);
    expect(r.principal).toBe(DEFAULTS.car.price - DEFAULTS.car.downPayment);
  });
});

describe('borrowing capacity', () => {
  it('hits the 35 % debt ratio exactly', () => {
    const i = { ...DEFAULTS.mortgage, useOtherLoans: true };
    const cap = borrowingCapacity(i);
    const pay = monthlyPayment(cap, i.rate / 100, i.months) + (cap * i.insuranceRate) / 100 / 12;
    expect((pay + i.otherLoans) / i.income).toBeCloseTo(0.35, 3);
  });
});
