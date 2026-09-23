import { describe, expect, it } from 'vitest';
import { balanceAfter, checkOffer, earlyRepayment, earlyRepaymentPenalty, insuranceSwitch, monthlyPayment, renegotiate } from './index';

const TODAY = new Date('2026-09-22');

describe('early repayment', () => {
  it('caps the penalty at 6 months of interest or 3 % of the balance', () => {
    expect(earlyRepaymentPenalty(20000, 0.03, 150000)).toBe(300); // 6 × 20,000 × 0.25 %
    expect(earlyRepaymentPenalty(150000, 0.04, 150000)).toBe(3000); // 6 months = 3,000 = 2 %… vs 3 % = 4,500
    expect(earlyRepaymentPenalty(150000, 0.08, 150000)).toBe(4500); // 3 % cap
  });
  it('shortening keeps the payment and saves more interest than lowering it', () => {
    const base = { principal: 200000, rate: 0.032, months: 240, paidMonths: 60, amount: 30000 };
    const s = earlyRepayment({ ...base, mode: 'shorten' });
    const l = earlyRepayment({ ...base, mode: 'lower' });
    expect(s.balanceBefore).toBeCloseTo(balanceAfter(200000, 0.032, 240, 60), 2);
    expect(s.newRemainingMonths).toBeLessThan(s.remainingMonths);
    expect(Math.abs(s.newPayment - s.payment)).toBeLessThan(15);
    expect(l.newRemainingMonths).toBe(180);
    expect(l.newPayment).toBeLessThan(l.payment);
    expect(s.interestSaved).toBeGreaterThan(l.interestSaved);
    expect(s.netSaving).toBeCloseTo(s.interestSaved - s.penalty, 2);
  });
  it('handles a full repayment and the no-penalty case', () => {
    const r = earlyRepayment({ principal: 100000, rate: 0.03, months: 120, paidMonths: 24, amount: 1e9, mode: 'shorten', noPenalty: true });
    expect(r.full).toBe(true);
    expect(r.penalty).toBe(0);
    expect(r.interestAfter).toBe(0);
  });
});

describe('renegotiation', () => {
  const base = { balance: 180000, remainingMonths: 180, currentRate: 0.045, newRate: 0.032, newMonths: 180, currentInsurance: 60, newInsurance: 60, fees: 1000, guarantee: 1500, penalty: true, financeCosts: false };
  it('computes penalty, new payment and total saving', () => {
    const r = renegotiate(base);
    expect(r.penaltyAmount).toBe(4050); // 6 months: 180,000 × 0.375 % × 6 = 4,050 < 5,400
    expect(r.costs).toBe(6550);
    expect(r.newPayment).toBeCloseTo(monthlyPayment(180000, 0.032, 180), 1);
    expect(r.saving).toBeGreaterThan(0);
    expect(r.breakEvenMonth).toBeGreaterThan(1);
    expect(r.breakEvenMonth!).toBeLessThan(60);
  });
  it('finances the costs inside the new loan when asked', () => {
    const r = renegotiate({ ...base, financeCosts: true });
    expect(r.newPrincipal).toBe(186550);
    expect(r.breakEvenMonth).toBe(1);
  });
  it('reports no break-even when it does not pay off', () => {
    expect(renegotiate({ ...base, newRate: 0.044 }).breakEvenMonth).toBeNull();
  });
});

describe('insurance switch', () => {
  it('saves when moving from initial capital to remaining balance at a lower rate', () => {
    const r = insuranceSwitch({ initialPrincipal: 250000, balance: 200000, remainingMonths: 200, loanRate: 0.03, cover: 1, current: { rate: 0.0034, base: 'initial' }, next: { rate: 0.0012, base: 'remaining' } });
    expect(r.current.first).toBeCloseTo(70.83, 2);
    expect(r.next.first).toBe(20);
    expect(r.saving).toBeGreaterThan(10000);
  });
});

describe('check my offer', () => {
  const pay = Math.round(monthlyPayment(250000, 0.032, 300) * 100) / 100;
  const good = { amount: 250000, rate: 0.032, months: 300, payment: pay, insurance: 62.5, fees: 1000, guarantee: 2175, taeg: 0, totalCost: 0, home: true };
  it('accepts a consistent offer', () => {
    const first = checkOffer(good, TODAY);
    const res = checkOffer({ ...good, taeg: first.computedTaeg, totalCost: first.computedCost }, TODAY);
    expect(res.checks.every((c) => c.status === 'ok')).toBe(true);
  });
  it('flags a payment that does not match the rate, and a TAEG over the legal maximum', () => {
    const res = checkOffer({ ...good, payment: pay + 40, taeg: 0.056 }, TODAY);
    const by = Object.fromEntries(res.checks.map((c) => [c.key, c.status]));
    expect(by.payment).toBe('bad');
    expect(by.rate).toBe('bad');
    expect(by.usury).toBe('bad');
  });
});
