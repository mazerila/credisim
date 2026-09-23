import { describe, expect, it } from 'vitest';
import { DEFAULTS, simulate, type Inputs } from './index';

const TODAY = new Date('2026-09-22');
const base: Inputs = { ...DEFAULTS.mortgage, rateType: 'variable', indexRate: 3.0, margin: 1.0, scenario: 'stable' };

describe('variable and capped rates', () => {
  it('behaves like a fixed loan at index + margin when the index is stable', () => {
    const v = simulate(base, TODAY);
    const f = simulate({ ...DEFAULTS.mortgage, rate: 4.0 }, TODAY);
    expect(v.monthlyTotal).toBeCloseTo(f.monthlyTotal, 2);
    expect(v.totalInterest).toBeCloseTo(f.totalInterest, 0);
    expect(v.usury.category).toBe('variable');
    expect(v.variable!.maxRate).toBeCloseTo(0.04, 10);
  });
  it('re-computes the payment each year when the index rises, and still ends at zero', () => {
    const r = simulate({ ...base, scenario: 'up2' }, TODAY);
    const y1 = r.rows[0].payment, y2 = r.rows[12].payment, y3 = r.rows[24].payment, y4 = r.rows[36].payment;
    expect(y2).toBeGreaterThan(y1);
    expect(y3).toBeGreaterThan(y2);
    expect(y4).toBeCloseTo(y3, 0);
    expect(r.mainRows.at(-1)!.balance).toBe(0);
    expect(r.variable!.maxRate).toBeCloseTo(0.06, 10);
    const interestAndIns = r.totalInterest + r.totalInsurance;
    expect(interestAndIns).toBeGreaterThan(r.variable!.costIfStable);
  });
  it('keeps the TAEG at the initial rate (EU rule) whatever the scenario', () => {
    const a = simulate({ ...base, scenario: 'up3' }, TODAY);
    const b = simulate(base, TODAY);
    expect(a.taeg).toBeCloseTo(b.taeg, 10);
  });
  it('caps the rate move and gives a worst case', () => {
    const r = simulate({ ...base, rateType: 'capped', cap: 1, scenario: 'up3' }, TODAY);
    expect(r.variable!.maxRate).toBeCloseTo(0.05, 10);
    expect(r.variable!.worstMonthly).toBeGreaterThan(r.monthlyTotal);
    const down = simulate({ ...base, rateType: 'capped', cap: 1, scenario: 'down1' }, TODAY);
    expect(down.variable!.maxRate).toBeCloseTo(0.04, 10);
    expect(down.totalInterest).toBeLessThan(simulate(base, TODAY).totalInterest);
  });
});
