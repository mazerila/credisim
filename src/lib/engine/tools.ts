import { monthlyPayment, monthsFromPayment, rateFromPayment, schedule } from './annuity';
import { usuryLimit, usuryTable } from './rules';
import { actuarialRate } from './taeg';
import type { InsuranceBase } from './types';

const cents = (v: number) => Math.round(v * 100) / 100;
const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

/**
 * Early-repayment penalty (indemnités de remboursement anticipé) on a home loan:
 * at most 6 months of interest on the amount repaid, and at most 3 % of the
 * capital still owed before the repayment.
 */
export function earlyRepaymentPenalty(amountRepaid: number, annualRate: number, balanceBefore: number): number {
  return cents(Math.min(amountRepaid * (annualRate / 12) * 6, balanceBefore * 0.03));
}

/** Capital still owed after `paid` monthly payments of a fixed-payment loan. */
export function balanceAfter(principal: number, annualRate: number, months: number, paid: number): number {
  if (paid <= 0) return principal;
  if (paid >= months) return 0;
  return schedule(principal, annualRate, months)[paid - 1].balance;
}

// ---------------------------------------------------------------------------
// Early repayment
// ---------------------------------------------------------------------------

export interface EarlyRepaymentInput {
  principal: number;
  /** annual rate, decimal */
  rate: number;
  months: number;
  /** payments already made when repaying */
  paidMonths: number;
  amount: number;
  /** keep the payment and finish sooner, or keep the end date and pay less */
  mode: 'shorten' | 'lower';
  /** no penalty applies (e.g. sale after a job move, or the contract waives it) */
  noPenalty?: boolean;
}

export interface EarlyRepaymentResult {
  balanceBefore: number;
  repaid: number;
  penalty: number;
  full: boolean;
  payment: number;
  newPayment: number;
  remainingMonths: number;
  newRemainingMonths: number;
  interestBefore: number;
  interestAfter: number;
  interestSaved: number;
  netSaving: number;
}

export function earlyRepayment(x: EarlyRepaymentInput): EarlyRepaymentResult {
  const rows = schedule(x.principal, x.rate, x.months);
  const k = Math.max(0, Math.min(x.months - 1, Math.round(x.paidMonths)));
  const balanceBefore = k ? rows[k - 1].balance : x.principal;
  const repaid = Math.max(0, Math.min(x.amount, balanceBefore));
  const penalty = x.noPenalty ? 0 : earlyRepaymentPenalty(repaid, x.rate, balanceBefore);
  const remainingMonths = x.months - k;
  const payment = rows[0]?.payment ?? 0;
  const interestBefore = sum(rows.slice(k).map((r) => r.interest));
  const left = cents(balanceBefore - repaid);

  let newRemainingMonths = 0, newPayment = 0, interestAfter = 0;
  if (left > 0) {
    if (x.mode === 'shorten') {
      newRemainingMonths = Math.min(remainingMonths, monthsFromPayment(left, x.rate, payment));
      newPayment = cents(monthlyPayment(left, x.rate, newRemainingMonths));
    } else {
      newRemainingMonths = remainingMonths;
      newPayment = cents(monthlyPayment(left, x.rate, remainingMonths));
    }
    interestAfter = sum(schedule(left, x.rate, newRemainingMonths).map((r) => r.interest));
  }
  const interestSaved = cents(interestBefore - interestAfter);
  return {
    balanceBefore, repaid, penalty, full: left <= 0, payment, newPayment, remainingMonths, newRemainingMonths,
    interestBefore: cents(interestBefore), interestAfter: cents(interestAfter), interestSaved, netSaving: cents(interestSaved - penalty),
  };
}

// ---------------------------------------------------------------------------
// Renegotiation / buy-out by another bank
// ---------------------------------------------------------------------------

export interface RenegotiationInput {
  balance: number;
  remainingMonths: number;
  currentRate: number;
  newRate: number;
  newMonths: number;
  /** monthly insurance today and with the new loan */
  currentInsurance: number;
  newInsurance: number;
  /** application + broker fees for the new loan */
  fees: number;
  /** new guarantee (0 for a renegotiation with the same bank) */
  guarantee: number;
  /** charge the early-repayment penalty (a buy-out by another bank) */
  penalty: boolean;
  /** add penalty, fees and guarantee to the new loan instead of paying them upfront */
  financeCosts: boolean;
}

export interface RenegotiationResult {
  penaltyAmount: number;
  costs: number;
  newPrincipal: number;
  currentPayment: number;
  newPayment: number;
  currentTotal: number;
  newTotal: number;
  saving: number;
  monthlyDifference: number;
  /** month when the cumulated monthly savings pay back the upfront costs (null: never, 0: at once) */
  breakEvenMonth: number | null;
}

export function renegotiate(x: RenegotiationInput): RenegotiationResult {
  const penaltyAmount = x.penalty ? earlyRepaymentPenalty(x.balance, x.currentRate, x.balance) : 0;
  const costs = cents(penaltyAmount + x.fees + x.guarantee);
  const newPrincipal = cents(x.balance + (x.financeCosts ? costs : 0));
  const upfront = x.financeCosts ? 0 : costs;

  const currentPayment = cents(monthlyPayment(x.balance, x.currentRate, x.remainingMonths));
  const newPayment = cents(monthlyPayment(newPrincipal, x.newRate, x.newMonths));
  const currentTotal = cents((currentPayment + x.currentInsurance) * x.remainingMonths);
  const newTotal = cents((newPayment + x.newInsurance) * x.newMonths + upfront);

  // First month when the cumulated monthly savings cover what was paid upfront.
  let breakEvenMonth: number | null = null;
  if (currentTotal > newTotal) {
    let cumulative = -upfront;
    const horizon = Math.max(x.remainingMonths, x.newMonths);
    for (let m = 1; m <= horizon; m++) {
      const old = m <= x.remainingMonths ? currentPayment + x.currentInsurance : 0;
      const neu = m <= x.newMonths ? newPayment + x.newInsurance : 0;
      cumulative += old - neu;
      if (cumulative >= 0) { breakEvenMonth = m; break; }
    }
  }

  return {
    penaltyAmount, costs, newPrincipal, currentPayment, newPayment, currentTotal, newTotal,
    saving: cents(currentTotal - newTotal),
    monthlyDifference: cents(currentPayment + x.currentInsurance - newPayment - x.newInsurance),
    breakEvenMonth,
  };
}

// ---------------------------------------------------------------------------
// Borrower-insurance switch (loi Lemoine)
// ---------------------------------------------------------------------------

export interface InsuranceSwitchInput {
  initialPrincipal: number;
  balance: number;
  remainingMonths: number;
  /** loan rate, decimal: needed to follow the balance month by month */
  loanRate: number;
  /** coverage, decimal (1 = 100 %) */
  cover: number;
  current: { rate: number; base: InsuranceBase };
  next: { rate: number; base: InsuranceBase };
}

export function insuranceSwitch(x: InsuranceSwitchInput) {
  const rows = schedule(x.balance, x.loanRate, x.remainingMonths);
  const cost = (c: { rate: number; base: InsuranceBase }) => {
    const monthly = rows.map((r, i) => {
      const bal = i === 0 ? x.balance : rows[i - 1].balance;
      return cents(((c.base === 'initial' ? x.initialPrincipal : bal) * c.rate * x.cover) / 12);
    });
    return { first: monthly[0] ?? 0, total: cents(sum(monthly)) };
  };
  const current = cost(x.current);
  const next = cost(x.next);
  return { current, next, saving: cents(current.total - next.total), monthlySaving: cents(current.first - next.first) };
}

// ---------------------------------------------------------------------------
// Check a bank offer
// ---------------------------------------------------------------------------

export interface OfferInput {
  amount: number;
  /** nominal rate, decimal */
  rate: number;
  months: number;
  /** monthly payment excluding insurance, as written in the offer */
  payment: number;
  insurance: number;
  fees: number;
  guarantee: number;
  /** TAEG written in the offer, decimal */
  taeg: number;
  /** total cost of credit written in the offer (0 = not given) */
  totalCost: number;
  /** home loan (duration usury bands) or consumer loan (amount bands) */
  home: boolean;
}

export type CheckStatus = 'ok' | 'warn' | 'bad';
export interface OfferCheck {
  key: 'payment' | 'rate' | 'taeg' | 'cost' | 'usury';
  status: CheckStatus;
  expected: number;
  stated: number;
}

export function checkOffer(x: OfferInput, today = new Date()) {
  const expectedPayment = cents(monthlyPayment(x.amount, x.rate, x.months));
  const impliedRate = rateFromPayment(x.amount, x.months, x.payment);
  const flows = Array(x.months).fill(x.payment + x.insurance);
  const computedTaeg = actuarialRate(x.amount - x.fees - x.guarantee, flows);
  const computedCost = cents((x.payment + x.insurance) * x.months - x.amount + x.fees + x.guarantee);

  const { table } = usuryTable(today);
  const category = x.home
    ? x.months < 120 ? 'fixedUnder10y' : x.months < 240 ? 'fixed10to20y' : 'fixed20yPlus'
    : x.amount <= 3000 ? 'upTo3000' : x.amount <= 6000 ? 'upTo6000' : 'above6000';
  const limit = usuryLimit(category, table);

  const paymentGap = Math.abs(expectedPayment - x.payment);
  const taegGap = Math.abs(computedTaeg - x.taeg);
  const costGap = Math.abs(computedCost - x.totalCost);
  const checks: OfferCheck[] = [
    { key: 'payment', status: paymentGap <= 1 ? 'ok' : paymentGap <= 5 ? 'warn' : 'bad', expected: expectedPayment, stated: x.payment },
    { key: 'rate', status: Math.abs(impliedRate - x.rate) <= 0.0002 ? 'ok' : Math.abs(impliedRate - x.rate) <= 0.001 ? 'warn' : 'bad', expected: impliedRate, stated: x.rate },
    // Offers may include costs we don't see (account fees, valuation…), so a TAEG a little higher is only a warning.
    { key: 'taeg', status: taegGap <= 0.0005 ? 'ok' : x.taeg > computedTaeg && taegGap <= 0.003 ? 'warn' : 'bad', expected: computedTaeg, stated: x.taeg },
    { key: 'usury', status: Math.max(x.taeg, computedTaeg) <= limit ? 'ok' : 'bad', expected: limit, stated: Math.max(x.taeg, computedTaeg) },
  ];
  if (x.totalCost > 0) {
    checks.push({ key: 'cost', status: costGap <= Math.max(50, computedCost * 0.005) ? 'ok' : costGap <= computedCost * 0.03 ? 'warn' : 'bad', expected: computedCost, stated: x.totalCost });
  }
  return { checks, expectedPayment, impliedRate, computedTaeg, computedCost, usuryLimit: limit, quarter: table.quarter };
}
