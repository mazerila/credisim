import { monthlyPayment, schedule } from './annuity';
import { usuryTable } from './rules';

const cents = (v: number) => Math.round(v * 100) / 100;

// ---------------------------------------------------------------------------
// Bridge loan (prêt relais)
// ---------------------------------------------------------------------------

export interface BridgeInput {
  /** estimated value of the home being sold */
  value: number;
  /** share of the value the bank advances, decimal (usually 0.6–0.8) */
  share: number;
  /** capital still owed on that home (repaid from the bridge loan) */
  owed: number;
  rate: number;
  months: number;
  /** partial: interest paid monthly · total: interest paid at the sale */
  mode: 'partial' | 'total';
}

export function bridgeLoan(x: BridgeInput) {
  const amount = Math.max(0, cents(x.value * x.share - x.owed));
  const r = x.rate / 12;
  const monthly = x.mode === 'partial' ? cents(amount * r) : 0;
  const repaidAtSale = x.mode === 'partial' ? amount : cents(amount * Math.pow(1 + r, x.months));
  const interest = x.mode === 'partial' ? cents(monthly * x.months) : cents(repaidAtSale - amount);
  // What is left from the sale after repaying the bridge and the old loan.
  const leftFromSale = cents(x.value - x.owed - repaidAtSale);
  const leftIfTenPctLower = cents(x.value * 0.9 - x.owed - repaidAtSale);
  const { table } = usuryTable();
  return { amount, monthly, repaidAtSale, interest, leftFromSale, leftIfTenPctLower, usuryLimit: table.mortgage.bridge };
}

// ---------------------------------------------------------------------------
// Rental investment
// ---------------------------------------------------------------------------

export interface RentalInput {
  /** price + notary fees + works + fees: everything the purchase costs */
  totalCost: number;
  price: number;
  loanAmount: number;
  rate: number;
  months: number;
  /** insurance per month */
  insurance: number;
  rent: number;
  /** months without a tenant per year */
  vacancyMonths: number;
  /** owner's charges not paid by the tenant, per month */
  charges: number;
  propertyTax: number;
  /** management fee, decimal of rents collected */
  managementPct: number;
  /** landlord insurance (PNO) per year */
  ownerInsurance: number;
}

export function rentalInvestment(x: RentalInput) {
  const rentsPerYear = x.rent * Math.max(0, 12 - x.vacancyMonths);
  const costsPerYear = x.charges * 12 + x.propertyTax + rentsPerYear * x.managementPct + x.ownerInsurance;
  const netRentPerYear = rentsPerYear - costsPerYear;
  const payment = cents(monthlyPayment(x.loanAmount, x.rate, x.months));
  const cashFlow = cents(netRentPerYear / 12 - payment - x.insurance);
  return {
    grossYield: x.price > 0 ? (x.rent * 12) / x.price : 0,
    netYield: x.totalCost > 0 ? netRentPerYear / x.totalCost : 0,
    rentsPerYear: cents(rentsPerYear),
    costsPerYear: cents(costsPerYear),
    netRentPerYear: cents(netRentPerYear),
    payment,
    cashFlow,
  };
}

// ---------------------------------------------------------------------------
// Rent or buy
// ---------------------------------------------------------------------------

export interface RentVsBuyInput {
  price: number;
  /** notary + fees + guarantee paid when buying */
  buyingCosts: number;
  downPayment: number;
  rate: number;
  months: number;
  insurance: number;
  /** owner costs per year: property tax, upkeep, co-ownership */
  ownerCostsPerYear: number;
  /** property value growth per year, decimal */
  priceGrowth: number;
  /** selling costs when you sell, decimal of the value (agency…) */
  sellingCosts: number;
  rent: number;
  rentGrowth: number;
  /** return on savings the renter invests instead, decimal per year */
  savingsReturn: number;
  years: number;
}

export interface RentVsBuyYear {
  year: number;
  buyer: number;
  renter: number;
}

/**
 * Net worth after each year. Both start with the same cash: the down payment.
 * The buyer owns the home (minus the loan and selling costs); the renter invests that cash,
 * plus every month the buyer pays more than the rent (or withdraws when rent is higher).
 */
export function rentVsBuy(x: RentVsBuyInput) {
  const loan = Math.max(0, x.price + x.buyingCosts - x.downPayment);
  const rows = schedule(loan, x.rate, x.months);
  const monthlyReturn = Math.pow(1 + x.savingsReturn, 1 / 12) - 1;
  let renterSavings = x.downPayment;
  let rent = x.rent;
  let ownerCosts = x.ownerCostsPerYear;
  const out: RentVsBuyYear[] = [];
  let breakEvenYear: number | null = null;
  for (let y = 1; y <= x.years; y++) {
    for (let m = 1; m <= 12; m++) {
      const k = (y - 1) * 12 + m;
      const row = rows[k - 1];
      const buyerOut = (row ? row.payment + x.insurance : 0) + ownerCosts / 12;
      renterSavings = renterSavings * (1 + monthlyReturn) + (buyerOut - rent);
    }
    const value = x.price * Math.pow(1 + x.priceGrowth, y);
    const owed = rows[Math.min(y * 12, rows.length) - 1]?.balance ?? 0;
    const buyer = cents(value * (1 - x.sellingCosts) - owed);
    const renter = cents(renterSavings);
    out.push({ year: y, buyer, renter });
    if (breakEvenYear === null && buyer >= renter) breakEvenYear = y;
    rent *= 1 + x.rentGrowth;
    ownerCosts *= 1 + x.rentGrowth; // owner costs assumed to follow rents (inflation)
  }
  return { loan, years: out, breakEvenYear, final: out[out.length - 1] };
}
