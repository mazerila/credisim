import { monthlyPayment, monthsFromPayment } from './annuity';
import { usuryCategory, usuryLimit, usuryTable } from './rules';
import { actuarialRate } from './taeg';

const cents = (v: number) => Math.round(v * 100) / 100;
const usury = (amount: number, today?: Date) => {
  const { table } = usuryTable(today);
  return usuryLimit(usuryCategory('personal', amount, 12), table);
};

// ---------------------------------------------------------------------------
// Revolving credit (crédit renouvelable)
// ---------------------------------------------------------------------------

/**
 * Each payment must repay at least 1/36 of the amount drawn (up to €3,000) or
 * 1/60 (above), so the credit is repaid within 3 or 5 years (loi Lagarde).
 */
export function revolvingMinimumCapital(drawn: number): number {
  return drawn / (drawn <= 3000 ? 36 : 60);
}

export interface RevolvingResult {
  payment: number;
  minimumPayment: number;
  months: number;
  totalInterest: number;
  totalPaid: number;
  taeg: number;
  usuryLimit: number;
  /** same amount repaid over the same number of months with a personal loan */
  loan: { rate: number; payment: number; totalInterest: number };
  extraCost: number;
}

export function revolving(drawn: number, annualRate: number, payment: number, loanRate: number, today?: Date): RevolvingResult {
  const r = annualRate / 12;
  const minimumPayment = cents(drawn * r + revolvingMinimumCapital(drawn));
  const pay = Math.max(payment, minimumPayment);
  const flows: number[] = [];
  let balance = drawn;
  let totalInterest = 0;
  for (let k = 0; k < 600 && balance > 0.005; k++) {
    const interest = cents(balance * r);
    const capital = Math.min(balance, Math.max(pay - interest, revolvingMinimumCapital(drawn)));
    balance = cents(balance - capital);
    totalInterest += interest;
    flows.push(cents(interest + capital));
  }
  const months = flows.length;
  const loanPayment = cents(monthlyPayment(drawn, loanRate, months));
  const loanInterest = cents(loanPayment * months - drawn);
  return {
    payment: pay, minimumPayment, months,
    totalInterest: cents(totalInterest), totalPaid: cents(drawn + totalInterest),
    taeg: actuarialRate(drawn, flows), usuryLimit: usury(drawn, today),
    loan: { rate: loanRate, payment: loanPayment, totalInterest: loanInterest },
    extraCost: cents(totalInterest - loanInterest),
  };
}

// ---------------------------------------------------------------------------
// Split payment / buy now, pay later (paiement en 3x, 4x…)
// ---------------------------------------------------------------------------

export interface BnplResult {
  instalment: number;
  fees: number;
  /** paid on the day of purchase (first instalment + fees) */
  today: number;
  total: number;
  /** credit actually granted: price minus what is paid on day one */
  credit: number;
  taeg: number;
  usuryLimit: number;
}

/**
 * n equal monthly instalments, the first one on the day of purchase together with the fees.
 * The TAEG compares what you borrow (price − day-one payment) with the later instalments.
 */
export function bnpl(price: number, instalments: number, feePct: number, feeFixed: number, today?: Date): BnplResult {
  const n = Math.max(2, Math.round(instalments));
  const instalment = cents(price / n);
  const fees = cents(price * feePct + feeFixed);
  const dayOne = cents(price - instalment * (n - 1) + fees);
  const credit = cents(price - (dayOne - fees));
  const flows = Array(n - 1).fill(instalment);
  const taeg = fees > 0 ? actuarialRate(credit - fees, flows) : 0;
  return { instalment, fees, today: dayOne, total: cents(price + fees), credit, taeg, usuryLimit: usury(credit, today) };
}

// ---------------------------------------------------------------------------
// Car: lease with purchase option (LOA) or long-term rental (LLD) vs a loan
// ---------------------------------------------------------------------------

export interface LeaseInput {
  price: number;
  /** first larger rent / down payment */
  firstPayment: number;
  rent: number;
  months: number;
  /** purchase option at the end (LOA); 0 for a rental you must return (LLD) */
  option: number;
  /** what the car is worth at the end (market value) */
  valueAtEnd: number;
  loanRate: number;
}

export function leaseVsLoan(x: LeaseInput) {
  const leaseFlows = Array(x.months).fill(x.rent);
  if (x.option > 0) leaseFlows[x.months - 1] += x.option;
  const financed = x.price - x.firstPayment;
  const leaseRate = financed > 0 && x.option > 0 ? actuarialRate(financed, leaseFlows) : null;

  const loanPayment = cents(monthlyPayment(financed, x.loanRate, x.months));
  const loanTotal = cents(x.firstPayment + loanPayment * x.months);
  const leaseReturn = cents(x.firstPayment + x.rent * x.months);
  const leaseBuy = cents(leaseReturn + x.option);
  return {
    loanPayment,
    loanTotal,
    leaseReturn,
    leaseBuy,
    leaseRate,
    // Net cost = what you paid − what you still own at the end
    net: {
      loan: cents(loanTotal - x.valueAtEnd),
      leaseReturn,
      leaseBuy: cents(leaseBuy - x.valueAtEnd),
    },
  };
}

// ---------------------------------------------------------------------------
// Debt consolidation (rachat de crédits)
// ---------------------------------------------------------------------------

export interface ExistingLoan {
  balance: number;
  payment: number;
  /** annual rate, decimal */
  rate: number;
}

export function consolidate(loans: ExistingLoan[], newRate: number, newMonths: number, fees: number, income: number) {
  const valid = loans.filter((l) => l.balance > 0 && l.payment > 0);
  const lines = valid.map((l) => {
    const months = monthsFromPayment(l.balance, l.rate, l.payment);
    return { ...l, months, stillToPay: Number.isFinite(months) ? cents(l.payment * months) : Infinity };
  });
  const balance = cents(valid.reduce((s, l) => s + l.balance, 0));
  const monthlyBefore = cents(valid.reduce((s, l) => s + l.payment, 0));
  const totalBefore = lines.reduce((s, l) => s + l.stillToPay, 0);
  const principal = cents(balance + fees);
  const monthlyAfter = cents(monthlyPayment(principal, newRate, newMonths));
  const totalAfter = cents(monthlyAfter * newMonths);
  return {
    lines,
    balance,
    principal,
    monthlyBefore,
    monthlyAfter,
    totalBefore: Number.isFinite(totalBefore) ? cents(totalBefore) : Infinity,
    totalAfter,
    extraCost: Number.isFinite(totalBefore) ? cents(totalAfter - totalBefore) : NaN,
    ratioBefore: income > 0 ? monthlyBefore / income : null,
    ratioAfter: income > 0 ? monthlyAfter / income : null,
    longestBefore: Math.max(0, ...lines.map((l) => l.months)),
  };
}
