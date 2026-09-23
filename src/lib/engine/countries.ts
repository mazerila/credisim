import data from '../data/eu/countries.json';
import type { Country, GuaranteeKind, Inputs } from './types';

/**
 * Country presets outside France: purchase costs (transfer tax by region and use +
 * notary/registration), the usual mortgage deed or guarantee, typical rates and a
 * bank guideline for the debt ratio. Estimates, September 2026 (data/eu/countries.json).
 */
export const COUNTRY_CODES = Object.keys(data.countries) as Country[];

type Tax = { tax: number; allowance?: number; fixed?: number; starterExempt?: number };
type Spec = {
  flag: string; lang: string; rate: number;
  insurance: { on: boolean; rate: number };
  debt: { limit: number; kind: 'law' | 'guideline' };
  maxYears: number | null; usury: boolean;
  regions?: Record<string, Record<string, Tax>>; defaultRegion?: string;
  notary?: { pct: number; fixed: number };
  guarantees: GuaranteeKind[]; defaultGuarantee: GuaranteeKind;
  guaranteeCost?: Partial<Record<GuaranteeKind, { rate: number; fixed: number; rateOther?: number; maxLoan?: number }>>;
  sources: string[];
};
export const COUNTRIES = data.countries as unknown as Record<Country, Spec>;

export const isCountry = (v: unknown): v is Country => typeof v === 'string' && v in COUNTRIES;

export function regionsOf(country: Country): string[] {
  return Object.keys(COUNTRIES[country].regions ?? {});
}

/** Which tax line applies: by use (own/other), property age (old/new), or both (Italy). */
function taxLine(i: Inputs): Tax | null {
  const spec = COUNTRIES[i.country];
  const region = spec.regions?.[i.region] ?? spec.regions?.[spec.defaultRegion ?? ''];
  if (!region) return null;
  const use = i.mainHome ? 'own' : 'other';
  return region[`${use}_${i.propertyKind}`] ?? region[use] ?? region[i.propertyKind] ?? region.all ?? null;
}

/** Purchase costs (taxes + notary + registration) for a country other than France. */
export function purchaseCosts(i: Inputs): { taxes: number; notary: number; total: number } {
  const spec = COUNTRIES[i.country];
  const line = taxLine(i);
  let taxes = 0;
  if (line) {
    const starterFree = line.starterExempt !== undefined && i.firstTimeBuyer && i.mainHome && i.price <= line.starterExempt;
    taxes = starterFree ? 0 : Math.max(0, i.price - (line.allowance ?? 0)) * line.tax + (line.fixed ?? 0);
  }
  const notary = spec.notary ? i.price * spec.notary.pct + spec.notary.fixed : 0;
  return { taxes, notary, total: taxes + notary };
}

/** Rate and fixed part of the guarantee / mortgage deed, as a share of the loan. */
export function countryGuarantee(i: Inputs): { rate: number; fixed: number; maxLoan?: number } | null {
  const c = COUNTRIES[i.country].guaranteeCost?.[i.guarantee];
  if (!c) return null;
  return { rate: !i.mainHome && c.rateOther !== undefined ? c.rateOther : c.rate, fixed: c.fixed, maxLoan: c.maxLoan };
}

/** Example values when switching to a country (amounts and household stay as they were). */
export function countryDefaults(country: Country): Partial<Inputs> {
  const s = COUNTRIES[country];
  return {
    country,
    region: s.defaultRegion ?? '',
    rate: s.rate,
    useInsurance: s.insurance.on,
    insuranceRate: s.insurance.rate,
    insuranceBase: country === 'FR' ? 'initial' : 'remaining',
    guarantee: s.defaultGuarantee,
    guaranteeAuto: true,
    useGuarantee: true,
    useNotary: true,
    notaryAuto: true,
    usePtz: false,
    useFileFee: country === 'FR',
  };
}
