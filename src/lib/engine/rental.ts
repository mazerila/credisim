import RULES from '../data/fr/rental-tax.json';
import { byYear, schedule } from './annuity';

/**
 * Rental investment, advanced: year-by-year cash flows after French income tax, the resale at the
 * horizon (with capital-gains tax), and a comparison with leaving the same money in a placement.
 * Every regime is computed so they can be compared; amounts are per year unless named monthly.
 */

export type TaxRegime = 'micro-foncier' | 'reel' | 'micro-bic' | 'lmnp-reel';
export const TAX_REGIMES: TaxRegime[] = ['micro-foncier', 'reel', 'micro-bic', 'lmnp-reel'];
export const isFurnished = (r: TaxRegime) => r === 'micro-bic' || r === 'lmnp-reel';

export interface ExtraCost {
  label: string;
  amount: number;
  /** once: paid in year `year` (0 = at purchase, in cash); monthly / yearly: every year, growing with inflation */
  kind: 'once' | 'monthly' | 'yearly';
  year: number;
}

export interface RentalAdvancedInput {
  price: number;
  /** notary fees and other purchase costs */
  purchaseCosts: number;
  downPayment: number;
  rate: number;
  months: number;
  /** borrower insurance per month */
  insurance: number;
  /** monthly rent, unfurnished */
  rent: number;
  vacancyMonths: number;
  /** non-recoverable owner charges per month */
  charges: number;
  propertyTax: number;
  managementPct: number;
  ownerInsurance: number;
  extras: ExtraCost[];
  years: number;
  rentGrowth: number;
  costGrowth: number;
  priceGrowth: number;
  /** agency and other costs when selling, share of the sale price */
  sellingCosts: number;
  /** what the same money would earn elsewhere, per year */
  opportunityRate: number;
  /** marginal income-tax rate (TMI) */
  taxRate: number;
  /** furnished: extra rent over the unfurnished rent, and the furniture bought at the start */
  furnishedPremium: number;
  furniture: number;
  /** LMNP réel: share of the price that is land (not depreciated) */
  landShare: number;
}

export interface RentalYear {
  year: number;
  rents: number;
  /** charges, property tax, management, landlord insurance, extra costs */
  costs: number;
  interest: number;
  loanPayments: number;
  taxable: number;
  /** income tax + social charges on the rent (negative: a saving on other income) */
  tax: number;
  /** after tax; what the owner receives (+) or adds (−) this year */
  cashFlow: number;
  /** what the money put in so far would have earned this year in the placement */
  opportunityCost: number;
  balance: number;
}

export interface RentalRegimeResult {
  regime: TaxRegime;
  available: boolean;
  /** money put in at the start: down payment, furniture, costs paid in cash */
  equity: number;
  rows: RentalYear[];
  totalTax: number;
  saleValue: number;
  capitalGainTax: number;
  /** sale price − selling costs − remaining loan − capital-gains tax */
  netSale: number;
  /** yearly return on the money put in (IRR); null when it cannot be computed */
  irr: number | null;
  /** final wealth with the investment − final wealth with the same flows in the placement */
  gainVsPlacement: number;
  /** interest the money tied up would have earned over the horizon, compounded */
  opportunityCost: number;
}

const r2 = (v: number) => Math.round(v * 100) / 100;

/** Share of the capital gain exempt after `years` of ownership: [income tax, social charges]. */
export function capitalGainAllowance(years: number): [number, number] {
  const y = Math.floor(years);
  const ir = y < 6 ? 0 : y >= 22 ? 1 : 0.06 * (y - 5);
  const ps = y < 6 ? 0 : y >= 30 ? 1 : y <= 21 ? 0.0165 * (y - 5) : 0.0165 * 16 + 0.016 + 0.09 * (y - 22);
  return [Math.min(1, ir), Math.min(1, ps)];
}

/** Yearly rate at which the flows (t = 0, 1, …) have a zero net value. */
export function irr(flows: number[]): number | null {
  const npv = (r: number) => flows.reduce((s, f, t) => s + f / Math.pow(1 + r, t), 0);
  let lo = -0.99, hi = 1;
  let a = npv(lo), b = npv(hi);
  if (a * b > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2, m = npv(mid);
    if (Math.abs(m) < 1e-7) return mid;
    if (m * a < 0) { hi = mid; b = m; } else { lo = mid; a = m; }
  }
  return (lo + hi) / 2;
}

/** Deficits carried forward, each usable for a limited number of years (oldest first). */
class Carry {
  private q: { year: number; v: number }[] = [];
  constructor(private life: number) {}
  add(year: number, v: number) { if (v > 0) this.q.push({ year, v }); }
  use(year: number, max: number): number {
    this.q = this.q.filter((d) => year - d.year <= this.life);
    let used = 0;
    for (const d of this.q) {
      const u = Math.min(d.v, max - used);
      d.v -= u; used += u;
      if (used >= max) break;
    }
    this.q = this.q.filter((d) => d.v > 0);
    return used;
  }
}

export function rentalRegime(x: RentalAdvancedInput, regime: TaxRegime): RentalRegimeResult {
  const H = Math.max(1, Math.round(x.years));
  const furnished = isFurnished(regime);
  const loan = Math.max(0, x.price + x.purchaseCosts - x.downPayment);
  const loanYears = byYear(schedule(loan, x.rate, x.months));
  const upfrontExtras = x.extras.filter((e) => e.kind === 'once' && e.year <= 0).reduce((s, e) => s + e.amount, 0);
  const equity = x.downPayment + upfrontExtras + (furnished ? x.furniture : 0);
  const social = furnished ? RULES.social.furnished : RULES.social.unfurnished;
  const rent0 = x.rent * (furnished ? 1 + x.furnishedPremium : 1);

  const depBuilding = (x.price * (1 - x.landShare)) / RULES.lmnp.buildingYears;
  const depFurniture = x.furniture / RULES.lmnp.furnitureYears;
  let depCarried = 0;
  const deficits = new Carry(RULES.deficitYears);
  let buildingDepUsed = 0;

  const rows: RentalYear[] = [];
  let available = true;
  let invested = equity; // money put in so far, for the opportunity cost
  let totalTax = 0;

  for (let y = 1; y <= H; y++) {
    const g = Math.pow(1 + x.rentGrowth, y - 1), c = Math.pow(1 + x.costGrowth, y - 1);
    const rents = rent0 * g * Math.max(0, 12 - x.vacancyMonths);
    const extras = x.extras.reduce((s, e) =>
      s + (e.kind === 'monthly' ? e.amount * 12 * c : e.kind === 'yearly' ? e.amount * c : e.year === y ? e.amount : 0), 0);
    const costs = (x.charges * 12 + x.propertyTax + x.ownerInsurance) * c + rents * x.managementPct + extras;
    const ly = loanYears[y - 1];
    const interest = ly?.interest ?? 0;
    const loanMonths = loan > 0 ? Math.max(0, Math.min(12, x.months - (y - 1) * 12)) : 0;
    const borrowerInsurance = x.insurance * loanMonths;
    const loanPayments = (ly?.payment ?? 0) + borrowerInsurance;
    const borrowCosts = interest + borrowerInsurance; // both deductible in the real regimes

    let taxable = 0, tax = 0;
    if (regime === 'micro-foncier') {
      if (rents > RULES.microFoncier.ceiling) available = false;
      taxable = rents * (1 - RULES.microFoncier.allowance);
      tax = taxable * (x.taxRate + social);
    } else if (regime === 'micro-bic') {
      if (rents > RULES.microBic.ceiling) available = false;
      taxable = rents * (1 - RULES.microBic.allowance);
      tax = taxable * (x.taxRate + social);
    } else if (regime === 'reel') {
      // Interest first against the rent; a deficit from other costs lowers other income (capped), the rest carries forward.
      const other = costs;
      const afterInterest = rents - borrowCosts;
      let global = 0, result: number;
      if (afterInterest < 0) {
        deficits.add(y, -afterInterest);
        global = Math.min(other, RULES.deficitFoncierCap);
        deficits.add(y, other - global);
        result = 0;
      } else if (afterInterest - other < 0) {
        const d = other - afterInterest;
        global = Math.min(d, RULES.deficitFoncierCap);
        deficits.add(y, d - global);
        result = 0;
      } else {
        result = afterInterest - other;
        result -= deficits.use(y, result);
      }
      taxable = result - global;
      tax = result * (x.taxRate + social) - global * x.taxRate;
    } else {
      // LMNP réel: purchase costs deducted in year 1; depreciation cannot create a loss and carries forward.
      const before = rents - costs - borrowCosts - (y === 1 ? x.purchaseCosts : 0);
      let result = 0;
      if (before < 0) deficits.add(y, -before);
      else {
        result = before - deficits.use(y, before);
        const depYear = depBuilding + (y <= RULES.lmnp.furnitureYears ? depFurniture : 0);
        const avail = depYear + depCarried;
        const use = Math.min(avail, result);
        // Building depreciation is used first; only that part is added back to the capital gain.
        const buildingShare = Math.min(use, depBuilding + depCarried);
        buildingDepUsed += buildingShare;
        depCarried = avail - use;
        result -= use;
      }
      if (before < 0) depCarried += depBuilding + (y <= RULES.lmnp.furnitureYears ? depFurniture : 0);
      taxable = result;
      tax = result * (x.taxRate + social);
    }
    const cashFlow = rents - costs - loanPayments - tax;
    const opportunityCost = invested * x.opportunityRate;
    if (cashFlow < 0) invested += -cashFlow;
    totalTax += tax;
    rows.push({ year: y, rents: r2(rents), costs: r2(costs), interest: r2(interest), loanPayments: r2(loanPayments), taxable: r2(taxable), tax: r2(tax), cashFlow: r2(cashFlow), opportunityCost: r2(opportunityCost), balance: r2(ly?.balance ?? 0) });
  }

  // Resale at the horizon
  const saleValue = x.price * Math.pow(1 + x.priceGrowth, H);
  const netSalePrice = saleValue * (1 - x.sellingCosts);
  const cg = RULES.capitalGain;
  const base = x.price * (1 + cg.acquisitionCostsFlat + (H > cg.worksFlatAfterYears ? cg.worksFlat : 0))
    - (regime === 'lmnp-reel' && cg.lmnpDepreciationAddedBack ? buildingDepUsed : 0);
  const gain = Math.max(0, netSalePrice - base);
  const [aIr, aPs] = capitalGainAllowance(H);
  const capitalGainTax = gain * (1 - aIr) * cg.incomeTax + gain * (1 - aPs) * RULES.social.capitalGain;
  const balance = rows[H - 1].balance;
  const netSale = netSalePrice - balance - capitalGainTax;

  const flows = [-equity, ...rows.map((r) => r.cashFlow)];
  flows[H] += netSale;
  const fv = (f: number[], r: number) => f.reduce((s, v, t) => s + v * Math.pow(1 + r, H - t), 0);
  const opportunityCost = equity * (Math.pow(1 + x.opportunityRate, H) - 1);

  return {
    regime, available, equity: r2(equity), rows,
    totalTax: r2(totalTax), saleValue: r2(saleValue), capitalGainTax: r2(capitalGainTax), netSale: r2(netSale),
    irr: irr(flows), gainVsPlacement: r2(fv(flows, x.opportunityRate)), opportunityCost: r2(opportunityCost),
  };
}

export function rentalAdvanced(x: RentalAdvancedInput) {
  return TAX_REGIMES.map((r) => rentalRegime(x, r));
}
