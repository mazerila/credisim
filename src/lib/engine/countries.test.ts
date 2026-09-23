import { describe, expect, it } from 'vitest';
import { countryDefaults, DEFAULTS, purchaseCosts, simulate, type Inputs } from './index';

const TODAY = new Date('2026-09-22');
const home = (country: Inputs['country'], extra: Partial<Inputs> = {}): Inputs => ({ ...DEFAULTS.mortgage, ...countryDefaults(country), price: 300000, downPayment: 60000, ...extra });

describe('country presets', () => {
  it('Belgium: 3 % in Wallonia after a €20,000 allowance for your own home, 12.5 % otherwise', () => {
    expect(purchaseCosts(home('BE', { region: 'wallonia' })).taxes).toBeCloseTo((300000 - 20000) * 0.03, 6);
    expect(purchaseCosts(home('BE', { region: 'wallonia', mainHome: false })).taxes).toBeCloseTo(300000 * 0.125, 6);
    expect(purchaseCosts(home('BE', { region: 'brussels' })).taxes).toBeCloseTo(100000 * 0.125, 6);
    expect(purchaseCosts(home('BE', { region: 'flanders' })).taxes).toBeCloseTo(6000, 6);
  });
  it('Germany: transfer tax by Land plus about 2 % notary and land registry', () => {
    const by = purchaseCosts(home('DE', { region: 'BY' }));
    expect(by.taxes).toBeCloseTo(300000 * 0.035, 6);
    expect(by.notary).toBeCloseTo(6000, 6);
    expect(purchaseCosts(home('DE', { region: 'NW' })).taxes).toBeCloseTo(300000 * 0.065, 6);
  });
  it('Spain: regional ITP for resale, VAT + AJD for new builds', () => {
    expect(purchaseCosts(home('ES', { region: 'madrid', propertyKind: 'old' })).taxes).toBeCloseTo(18000, 6);
    expect(purchaseCosts(home('ES', { region: 'madrid', propertyKind: 'new' })).taxes).toBeCloseTo(300000 * 0.107, 6);
  });
  it('Italy: prima casa vs seconda casa, resale vs from the builder', () => {
    expect(purchaseCosts(home('IT', { propertyKind: 'new' })).taxes).toBeCloseTo(300000 * 0.04 + 600, 6);
    expect(purchaseCosts(home('IT', { propertyKind: 'new', mainHome: false })).taxes).toBeCloseTo(300000 * 0.1 + 600, 6);
  });
  it('Netherlands: 2 %, 0 % for starters under the price limit, 8 % for investors; NHG only up to its ceiling', () => {
    expect(purchaseCosts(home('NL')).taxes).toBeCloseTo(6000, 6);
    expect(purchaseCosts(home('NL', { firstTimeBuyer: true })).taxes).toBe(0);
    expect(purchaseCosts(home('NL', { firstTimeBuyer: true, price: 600000 })).taxes).toBeCloseTo(12000, 6);
    expect(purchaseCosts(home('NL', { mainHome: false })).taxes).toBeCloseTo(24000, 6);
    const small = simulate(home('NL'), TODAY);
    expect(small.guarantee).toBeCloseTo(small.totalBorrowed * 0.004, 0);
    expect(simulate(home('NL', { price: 700000, downPayment: 50000 }), TODAY).guarantee).toBe(0);
  });
  it('applies French rules only in France', () => {
    const be = simulate(home('BE', { rate: 6, months: 360 }), TODAY);
    expect(be.usury.applies).toBe(false);
    expect(be.usury.ok).toBe(true);
    expect(be.duration).toBeNull();
    expect(be.debtRatio!.kind).toBe('guideline');
    expect(be.debtRatio!.limit).toBe(0.4);
    const fr = simulate({ ...DEFAULTS.mortgage, rate: 6, months: 360 }, TODAY);
    expect(fr.usury.applies).toBe(true);
    expect(fr.usury.ok).toBe(false);
    expect(fr.duration!.ok).toBe(false);
    expect(fr.debtRatio!.kind).toBe('law');
  });
  it('keeps the PTZ to France', () => {
    const r = simulate(home('BE', { usePtz: true, ptzZone: 'A', persons: 2, taxIncome: 40000, propertyKind: 'new' }), TODAY);
    expect(r.ptz).toBeNull();
  });
});
