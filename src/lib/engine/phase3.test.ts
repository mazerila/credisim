import { describe, expect, it } from 'vitest';
import { DEFAULTS, monthlyPayment, ptzEstimate, schedule, simulate, type Inputs } from './index';

const TODAY = new Date('2026-09-22');
const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

describe('amortization types', () => {
  it('linear: constant capital, falling payments, less interest than a fixed payment', () => {
    const lin = schedule(120000, 0.03, 120, undefined, { amortization: 'linear' });
    const ann = schedule(120000, 0.03, 120);
    expect(lin[0].capital).toBe(1000);
    expect(lin[50].capital).toBe(1000);
    expect(lin[0].payment).toBeGreaterThan(lin[119].payment);
    expect(sum(lin.map((r) => r.capital))).toBeCloseTo(120000, 2);
    expect(sum(lin.map((r) => r.interest))).toBeLessThan(sum(ann.map((r) => r.interest)));
  });
  it('in fine: interest only, all capital in the last month', () => {
    const rows = schedule(100000, 0.03, 60, undefined, { amortization: 'inFine' });
    expect(rows[0].payment).toBe(250);
    expect(rows[58].balance).toBe(100000);
    expect(rows[59].capital).toBe(100000);
    expect(rows[59].balance).toBe(0);
  });
});

describe('deferral', () => {
  it('partial: interest only during the deferral, then a higher fixed payment', () => {
    const rows = schedule(200000, 0.03, 240, undefined, { deferralType: 'partial', deferralMonths: 24 });
    expect(rows).toHaveLength(240);
    expect(rows[23]).toMatchObject({ capital: 0, payment: 500, balance: 200000 });
    expect(rows[24].payment).toBeCloseTo(monthlyPayment(200000, 0.03, 216), 1);
    expect(rows[239].balance).toBe(0);
  });
  it('total: nothing paid, interest added to the balance, and counted as cost', () => {
    const rows = schedule(200000, 0.03, 240, undefined, { deferralType: 'total', deferralMonths: 12 });
    expect(rows[0].payment).toBe(0);
    expect(rows[11].balance).toBeGreaterThan(200000);
    expect(rows[239].balance).toBe(0);
    const paid = sum(rows.map((r) => r.payment));
    const interest = sum(rows.map((r) => r.interest + (r.accrued ?? 0)));
    expect(paid - 200000).toBeCloseTo(interest, 1);
  });
});

describe('insurance per borrower', () => {
  it('adds each borrower’s premium', () => {
    const rows = schedule(200000, 0.03, 240, [
      { rate: 0.003, base: 'initial', cover: 1 },
      { rate: 0.0045, base: 'initial', cover: 0.5 },
    ]);
    expect(rows[0].insurance).toBeCloseTo(50 + 37.5, 2);
  });
});

describe('PTZ estimate (2025–2027 rules)', () => {
  it('finds the band from income ÷ family coefficient and applies the share', () => {
    const e = ptzEstimate('A', 'newFlat', 2, 40000, 300000);
    expect(e).toMatchObject({ eligible: true, band: 1, coefficient: 1.5, ceiling: 225000, share: 0.4, amount: 90000, deferralMonths: 96, totalMonths: 240 });
  });
  it('uses cost ÷ 9 when it is higher than the tax income', () => {
    expect(ptzEstimate('A', 'newFlat', 1, 20000, 450000)).toMatchObject({ eligible: false, issue: 'overIncome', income: 50000 });
  });
  it('rejects incomes above the zone ceiling', () => {
    expect(ptzEstimate('C', 'newHouse', 1, 30000, 150000).issue).toBe('overIncome');
    expect(ptzEstimate('C', 'newHouse', 1, 28000, 150000)).toMatchObject({ eligible: true, band: 3, share: 0.1, amount: 10000, deferralMonths: 0 });
  });
  it('allows old homes with works only in zones B2 and C', () => {
    expect(ptzEstimate('A', 'oldWithWorks', 2, 30000, 250000).issue).toBe('zone');
    expect(ptzEstimate('B2', 'oldWithWorks', 2, 30000, 200000).eligible).toBe(true);
  });
});

const withPtz: Inputs = {
  ...DEFAULTS.mortgage, propertyKind: 'new', useNotary: true, price: 300000, downPayment: 30000,
  usePtz: true, ptzZone: 'A', ptzKind: 'newFlat', persons: 2, taxIncome: 40000, ptzAuto: true, smoothing: false,
};

describe('simulation with a PTZ', () => {
  it('splits the loan between the PTZ and the main loan', () => {
    const r = simulate(withPtz, TODAY);
    expect(r.ptz?.amount).toBe(90000);
    expect(r.totalBorrowed).toBe(r.principal + 90000);
    expect(r.ptz!.rows[0].payment).toBe(0);
    expect(r.ptz!.rows[96].payment).toBeCloseTo(90000 / 144, 1);
    expect(r.rows[0].ptz).toBeGreaterThanOrEqual(0);
    expect(r.taegGlobal).toBeLessThan(r.taeg);
  });
  it('never lets the PTZ exceed the main loan', () => {
    const r = simulate({ ...withPtz, ptzAuto: false, ptzAmount: 250000 }, TODAY);
    expect(r.ptz!.amount).toBeLessThanOrEqual(r.principal);
  });
  it('smoothing keeps the total payment constant while the main loan runs', () => {
    const r = simulate({ ...withPtz, smoothing: true }, TODAY);
    expect(r.smoothingApplied).toBe(true);
    const totals = r.rows.slice(0, 299).map((x) => x.payment);
    expect(Math.max(...totals) - Math.min(...totals)).toBeLessThan(1);
    expect(r.mainRows.at(-1)!.balance).toBe(0);
    const plain = simulate(withPtz, TODAY);
    expect(r.monthlyMax).toBeLessThan(plain.monthlyMax);
  });
  it('uses the highest monthly total for the debt ratio', () => {
    const r = simulate(withPtz, TODAY);
    expect(r.debtRatio!.value).toBeCloseTo(r.monthlyMax / withPtz.income, 10);
    expect(r.phases.length).toBeGreaterThan(1);
  });
});

describe('rules and household', () => {
  it('allows 27 years for a new build with a deferral', () => {
    const base = { ...DEFAULTS.mortgage, months: 324, propertyKind: 'new' as const };
    expect(simulate(base, TODAY).duration!.ok).toBe(false);
    expect(simulate({ ...base, deferralType: 'partial', deferralMonths: 24 }, TODAY).duration!.ok).toBe(true);
  });
  it('computes the money left per person', () => {
    const r = simulate({ ...DEFAULTS.mortgage, persons: 3 }, TODAY);
    expect(r.moneyLeft!.total).toBeCloseTo(DEFAULTS.mortgage.income - r.monthlyMax, 6);
    expect(r.moneyLeft!.perPerson).toBeCloseTo(r.moneyLeft!.total / 3, 6);
  });
});
