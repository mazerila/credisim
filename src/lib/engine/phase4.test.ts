import { describe, expect, it } from 'vitest';
import { bnpl, bridgeLoan, consolidate, leaseVsLoan, monthlyPayment, rentalInvestment, rentVsBuy, revolving, revolvingMinimumCapital } from './index';

const TODAY = new Date('2026-09-22');

describe('revolving credit', () => {
  it('enforces the 1/36 or 1/60 minimum capital repayment', () => {
    expect(revolvingMinimumCapital(3000)).toBeCloseTo(3000 / 36, 6);
    expect(revolvingMinimumCapital(6000)).toBe(100);
    const r = revolving(3000, 0.2, 10, 0.065, TODAY);
    expect(r.payment).toBeCloseTo(3000 * 0.2 / 12 + 3000 / 36, 1);
    expect(r.months).toBeLessThanOrEqual(36);
  });
  it('costs far more than a personal loan over the same time', () => {
    const r = revolving(5000, 0.19, 150, 0.06, TODAY);
    expect(r.totalPaid).toBeCloseTo(5000 + r.totalInterest, 2);
    expect(r.taeg).toBeGreaterThan(0.2);
    expect(r.extraCost).toBeGreaterThan(0);
    expect(r.usuryLimit).toBe(0.1567);
  });
});

describe('pay in instalments', () => {
  it('is free without fees', () => {
    const r = bnpl(600, 4, 0, 0, TODAY);
    expect(r).toMatchObject({ instalment: 150, fees: 0, today: 150, total: 600, taeg: 0 });
  });
  it('shows a very high TAEG once fees are added', () => {
    const r = bnpl(600, 4, 0.022, 0, TODAY);
    expect(r.fees).toBeCloseTo(13.2, 2);
    expect(r.today).toBeCloseTo(163.2, 2);
    expect(r.credit).toBe(450);
    expect(r.taeg).toBeGreaterThan(0.15);
    expect(r.usuryLimit).toBe(0.2353);
  });
});

describe('LOA / LLD vs loan', () => {
  const x = { price: 30000, firstPayment: 3000, rent: 350, months: 48, option: 12000, valueAtEnd: 13000, loanRate: 0.055 };
  it('totals each option and finds the lease’s implied rate', () => {
    const r = leaseVsLoan(x);
    expect(r.leaseReturn).toBe(3000 + 350 * 48);
    expect(r.leaseBuy).toBe(r.leaseReturn + 12000);
    expect(r.loanPayment).toBeCloseTo(monthlyPayment(27000, 0.055, 48), 1);
    expect(r.leaseRate).toBeGreaterThan(0);
    expect(r.net.loan).toBeCloseTo(r.loanTotal - 13000, 2);
  });
  it('has no implied rate for a rental without option (LLD)', () => {
    expect(leaseVsLoan({ ...x, option: 0 }).leaseRate).toBeNull();
  });
});

describe('debt consolidation', () => {
  it('lowers the monthly payment but usually costs more in total', () => {
    const r = consolidate(
      [{ balance: 8000, payment: 280, rate: 0.07 }, { balance: 3000, payment: 150, rate: 0.19 }, { balance: 12000, payment: 320, rate: 0.055 }],
      0.065, 84, 800, 3500,
    );
    expect(r.balance).toBe(23000);
    expect(r.principal).toBe(23800);
    expect(r.monthlyAfter).toBeLessThan(r.monthlyBefore);
    expect(r.extraCost).toBeGreaterThan(0);
    expect(r.ratioAfter!).toBeLessThan(r.ratioBefore!);
  });
});

describe('bridge loan', () => {
  it('advances a share of the value minus what is still owed', () => {
    const p = bridgeLoan({ value: 300000, share: 0.7, owed: 50000, rate: 0.048, months: 18, mode: 'partial' });
    expect(p.amount).toBe(160000);
    expect(p.monthly).toBe(640);
    expect(p.interest).toBe(11520);
    expect(p.leftFromSale).toBe(90000);
    const t = bridgeLoan({ value: 300000, share: 0.7, owed: 50000, rate: 0.048, months: 18, mode: 'total' });
    expect(t.monthly).toBe(0);
    expect(t.interest).toBeGreaterThan(p.interest);
    expect(t.leftIfTenPctLower).toBeLessThan(t.leftFromSale);
  });
});

describe('rental investment', () => {
  it('computes yields and monthly cash flow before tax', () => {
    const r = rentalInvestment({ totalCost: 215000, price: 200000, loanAmount: 200000, rate: 0.034, months: 240, insurance: 50, rent: 900, vacancyMonths: 1, charges: 60, propertyTax: 1000, managementPct: 0.07, ownerInsurance: 150 });
    expect(r.grossYield).toBeCloseTo(0.054, 3);
    expect(r.rentsPerYear).toBe(9900);
    expect(r.netYield).toBeLessThan(r.grossYield);
    expect(r.cashFlow).toBeCloseTo(r.netRentPerYear / 12 - r.payment - 50, 1);
  });
});

describe('rent or buy', () => {
  const x = { price: 300000, buyingCosts: 24000, downPayment: 60000, rate: 0.032, months: 300, insurance: 60, ownerCostsPerYear: 2500, priceGrowth: 0.02, sellingCosts: 0.05, rent: 1100, rentGrowth: 0.015, savingsReturn: 0.03, years: 25 };
  it('buying wins in the long run when prices grow, not in the first years', () => {
    const r = rentVsBuy(x);
    expect(r.years).toHaveLength(25);
    expect(r.years[0].buyer).toBeLessThan(r.years[0].renter);
    expect(r.breakEvenYear).not.toBeNull();
    expect(r.final.buyer).toBeGreaterThan(r.final.renter);
  });
  it('can favour renting when prices stall and savings earn more', () => {
    const r = rentVsBuy({ ...x, priceGrowth: 0, savingsReturn: 0.06, years: 10 });
    expect(r.final.renter).toBeGreaterThan(r.final.buyer);
  });
});
