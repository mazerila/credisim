import type { InsuranceBase, Row, YearRow } from './types';

const cents = (v: number) => Math.round(v * 100) / 100;

/** Constant monthly payment (capital + interest) for a fixed-rate loan. */
export function monthlyPayment(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

/** Principal that a given monthly payment (capital + interest) can repay. */
export function principalFromPayment(payment: number, annualRate: number, months: number): number {
  if (payment <= 0 || months <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return payment * months;
  return (payment * (1 - Math.pow(1 + r, -months))) / r;
}

export interface InsuranceSpec {
  /** annual rate as a decimal, e.g. 0.003 */
  rate: number;
  base: InsuranceBase;
  /** total coverage as a decimal, e.g. 1 = 100 %, 2 = two borrowers at 100 % */
  cover: number;
}

/**
 * Month-by-month schedule. Each line is rounded to the cent like a bank statement;
 * the last payment absorbs the rounding so the balance ends at exactly zero.
 */
export function schedule(principal: number, annualRate: number, months: number, ins?: InsuranceSpec): Row[] {
  const rows: Row[] = [];
  if (principal <= 0 || months <= 0) return rows;
  const r = annualRate / 12;
  const pay = cents(monthlyPayment(principal, annualRate, months));
  let balance = principal;
  for (let k = 1; k <= months; k++) {
    const interest = cents(balance * r);
    const capital = k === months ? balance : Math.min(balance, cents(pay - interest));
    const insBase = ins ? (ins.base === 'initial' ? principal : balance) : 0;
    const insurance = ins ? cents((insBase * ins.rate * ins.cover) / 12) : 0;
    balance = Math.max(0, cents(balance - capital));
    rows.push({ k, payment: cents(interest + capital), interest, capital: cents(capital), insurance, balance });
  }
  return rows;
}

export function byYear(rows: Row[]): YearRow[] {
  const out: YearRow[] = [];
  for (const r of rows) {
    const i = Math.floor((r.k - 1) / 12);
    const y = (out[i] ??= { year: i + 1, payment: 0, interest: 0, capital: 0, insurance: 0, balance: 0 });
    y.payment += r.payment;
    y.interest += r.interest;
    y.capital += r.capital;
    y.insurance += r.insurance;
    y.balance = r.balance;
  }
  return out.map((y) => ({ ...y, payment: cents(y.payment), interest: cents(y.interest), capital: cents(y.capital), insurance: cents(y.insurance) }));
}

/** Number of months needed to repay `principal` with a given monthly payment. Infinity if never. */
export function monthsFromPayment(principal: number, annualRate: number, payment: number): number {
  if (principal <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return Math.ceil(principal / payment);
  if (payment <= principal * r) return Infinity;
  return Math.ceil(-Math.log(1 - (principal * r) / payment) / Math.log(1 + r) - 1e-9);
}

/** Nominal annual rate implied by principal, duration and payment (bisection). */
export function rateFromPayment(principal: number, months: number, payment: number): number {
  if (payment * months <= principal) return 0;
  let lo = 0, hi = 1;
  for (let it = 0; it < 200; it++) {
    const mid = (lo + hi) / 2;
    if (monthlyPayment(principal, mid, months) > payment) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}
