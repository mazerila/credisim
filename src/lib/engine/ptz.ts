import data from '../data/fr/ptz.json';
import type { PtzKind, PtzZone } from './types';

export const PTZ = data;

export type PtzIssue = 'overIncome' | 'zone' | 'noCost';

export interface PtzEstimate {
  eligible: boolean;
  issue?: PtzIssue;
  /** income band, 0-based (T1 = 0) */
  band: number;
  coefficient: number;
  /** income used for the band: max(tax income, cost / 9) */
  income: number;
  /** operation cost retained, capped by the zone ceiling */
  costRetained: number;
  ceiling: number;
  share: number;
  amount: number;
  deferralMonths: number;
  totalMonths: number;
}

export function familyCoefficient(persons: number): number {
  const i = Math.min(Math.max(1, Math.round(persons)), data.coefficients.length) - 1;
  return data.coefficients[i];
}

/**
 * PTZ 2025–2027 estimate. The band comes from max(tax income N-2, cost / 9) divided
 * by the family coefficient; the amount is the capped operation cost × the share for
 * that band and kind of home.
 */
export function ptzEstimate(zone: PtzZone, kind: PtzKind, persons: number, taxIncome: number, cost: number): PtzEstimate {
  const z = data.zones[zone];
  const coefficient = familyCoefficient(persons);
  const income = Math.max(Math.max(0, taxIncome), cost / 9);
  const perUnit = income / coefficient;
  const ceiling = z.costBase * Math.min(coefficient, data.operationCostCeilingMaxCoefficient);
  const costRetained = Math.min(Math.max(0, cost), ceiling);
  const base = { coefficient, income, costRetained, ceiling, band: -1, share: 0, amount: 0, deferralMonths: 0, totalMonths: 0 };

  if (cost <= 0) return { ...base, eligible: false, issue: 'noCost' };
  if (kind === 'oldWithWorks' && zone !== 'B2' && zone !== 'C') return { ...base, eligible: false, issue: 'zone' };
  const band = z.bands.findIndex((limit) => perUnit <= limit);
  if (band < 0) return { ...base, eligible: false, issue: 'overIncome' };

  const share = data.share[kind][band];
  const rep = data.repayment[band];
  return {
    ...base,
    eligible: true,
    band,
    share,
    amount: Math.floor(costRetained * share),
    deferralMonths: rep.deferralYears * 12,
    totalMonths: rep.totalYears * 12,
  };
}
