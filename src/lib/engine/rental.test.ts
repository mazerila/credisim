import { describe, expect, it } from 'vitest';
import { capitalGainAllowance, irr, rentalAdvanced, rentalRegime, type RentalAdvancedInput } from './index';

const BASE: RentalAdvancedInput = {
  price: 200000, purchaseCosts: 16000, downPayment: 20000, rate: 0.034, months: 240, insurance: 50,
  rent: 900, vacancyMonths: 1, charges: 60, propertyTax: 1000, managementPct: 0.07, ownerInsurance: 150,
  extras: [], years: 20, rentGrowth: 0.015, costGrowth: 0.02, priceGrowth: 0.015, sellingCosts: 0.05,
  opportunityRate: 0.03, taxRate: 0.3, furnishedPremium: 0.1, furniture: 5000, landShare: 0.15,
};

describe('capital-gain allowances', () => {
  it('follows the holding-period scale', () => {
    expect(capitalGainAllowance(5)).toEqual([0, 0]);
    expect(capitalGainAllowance(6)[0]).toBeCloseTo(0.06, 6);
    expect(capitalGainAllowance(21)[0]).toBeCloseTo(0.96, 6);
    expect(capitalGainAllowance(22)[0]).toBe(1);
    expect(capitalGainAllowance(22)[1]).toBeCloseTo(0.28, 6);
    expect(capitalGainAllowance(30)).toEqual([1, 1]);
  });
});

describe('irr', () => {
  it('finds the rate of a simple investment', () => {
    expect(irr([-100, 110])).toBeCloseTo(0.1, 6);
    expect(irr([-1000, 0, 0, 1331])).toBeCloseTo(0.1, 6);
    expect(irr([-100, -10])).toBeNull();
  });
});

describe('rental investment, advanced', () => {
  it('micro-foncier taxes 70 % of the rent', () => {
    const r = rentalRegime(BASE, 'micro-foncier');
    const y1 = r.rows[0];
    expect(y1.rents).toBeCloseTo(900 * 11, 2);
    expect(y1.tax).toBeCloseTo(900 * 11 * 0.7 * (0.3 + 0.172), 1);
    expect(r.available).toBe(true);
  });
  it('micro-BIC taxes 50 % of the furnished rent at 18.6 % social charges', () => {
    const y1 = rentalRegime(BASE, 'micro-bic').rows[0];
    expect(y1.rents).toBeCloseTo(990 * 11, 2);
    expect(y1.tax).toBeCloseTo(990 * 11 * 0.5 * (0.3 + 0.186), 1);
  });
  it('LMNP réel pays little or no tax in the first years thanks to depreciation', () => {
    const r = rentalRegime(BASE, 'lmnp-reel');
    expect(r.rows.slice(0, 5).every((y) => y.tax === 0)).toBe(true);
    expect(r.equity).toBe(25000);
  });
  it('réel with a deficit lowers tax on other income', () => {
    const r = rentalRegime({ ...BASE, extras: [{ label: 'Works', amount: 15000, kind: 'once', year: 1 }] }, 'reel');
    expect(r.rows[0].tax).toBeLessThan(0);
    expect(r.rows[0].tax).toBeGreaterThanOrEqual(-10700 * 0.3 - 1e-6);
  });
  it('flags micro-foncier above €15,000 of rent', () => {
    expect(rentalRegime({ ...BASE, rent: 1500 }, 'micro-foncier').available).toBe(false);
  });
  it('money paid at purchase in cash counts as money tied up', () => {
    const r = rentalRegime({ ...BASE, extras: [{ label: 'Kitchen', amount: 8000, kind: 'once', year: 0 }] }, 'reel');
    expect(r.equity).toBe(28000);
    expect(r.opportunityCost).toBeCloseTo(28000 * (1.03 ** 20 - 1), 0);
  });
  it('recurring costs lower the cash flow every year', () => {
    const a = rentalRegime(BASE, 'micro-foncier');
    const b = rentalRegime({ ...BASE, extras: [{ label: 'Accountant', amount: 50, kind: 'monthly', year: 0 }] }, 'micro-foncier');
    expect(a.rows[0].cashFlow - b.rows[0].cashFlow).toBeCloseTo(600, 2);
    expect(a.rows[9].cashFlow - b.rows[9].cashFlow).toBeCloseTo(600 * 1.02 ** 9, 2);
  });
  it('a higher placement rate makes the investment less attractive', () => {
    const lo = rentalRegime({ ...BASE, opportunityRate: 0.01 }, 'reel');
    const hi = rentalRegime({ ...BASE, opportunityRate: 0.06 }, 'reel');
    expect(hi.gainVsPlacement).toBeLessThan(lo.gainVsPlacement);
    expect(lo.irr).not.toBeNull();
    // IRR is where the gain vs placement crosses zero
    const at = rentalRegime({ ...BASE, opportunityRate: lo.irr! }, 'reel');
    expect(Math.abs(at.gainVsPlacement)).toBeLessThan(1);
  });
  it('taxes the capital gain after depreciation is added back in LMNP réel', () => {
    const all = rentalAdvanced({ ...BASE, years: 10, priceGrowth: 0.03 });
    const reel = all.find((r) => r.regime === 'reel')!;
    const lmnp = all.find((r) => r.regime === 'lmnp-reel')!;
    expect(lmnp.capitalGainTax).toBeGreaterThan(reel.capitalGainTax);
    expect(all).toHaveLength(4);
  });
});
