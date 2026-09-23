import type { Amortization, DeferralType, InsuranceBase, Row, YearRow } from './types';

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
  /** coverage as a decimal, e.g. 1 = 100 % */
  cover: number;
}

export interface ScheduleOptions {
  amortization?: Amortization;
  deferralType?: DeferralType;
  /** months at the start without capital repayment (partial) or without any payment (total) */
  deferralMonths?: number;
  /**
   * Fixed payment (capital + interest) for month k, used to smooth a main loan around a PTZ.
   * Return undefined to fall back to the normal amortization for that month.
   */
  paymentFor?: (k: number) => number | undefined;
  /** Variable rate: annual rate for month k (decimal). A new rate re-computes the payment on the remaining balance and months. */
  rateFor?: (k: number) => number;
}

/**
 * Month-by-month schedule. Each line is rounded to the cent like a bank statement;
 * the last payment absorbs the rounding so the balance ends at exactly zero.
 *
 * - annuity: constant payment · linear: constant capital · inFine: interest only, capital at the end
 * - partial deferral: interest only · total deferral: nothing paid, interest added to the balance
 * - insurance: one spec per borrower, summed; on the initial amount or on the remaining balance
 */
export function schedule(
  principal: number,
  annualRate: number,
  months: number,
  ins?: InsuranceSpec | InsuranceSpec[],
  opts: ScheduleOptions = {},
): Row[] {
  const rows: Row[] = [];
  if (principal <= 0 || months <= 0) return rows;
  const r = annualRate / 12;
  const insList = ins ? (Array.isArray(ins) ? ins : [ins]) : [];
  const amort = opts.amortization ?? 'annuity';
  const dType = opts.deferralType ?? 'none';
  const d = dType === 'none' ? 0 : Math.max(0, Math.min(months - 1, Math.round(opts.deferralMonths ?? 0)));

  let balance = principal;
  let annuity = 0;
  let linearCapital = 0;
  const insuranceFor = (bal: number) =>
    insList.reduce((s, x) => s + cents(((x.base === 'initial' ? principal : bal) * x.rate * x.cover) / 12), 0);

  let rate = annualRate;
  let rM = r;
  for (let k = 1; k <= months; k++) {
    const insurance = cents(insuranceFor(balance));
    if (opts.rateFor) {
      const next = opts.rateFor(k);
      if (next !== rate && k > d + 1) {
        // Revision: same end date, new payment on what is left.
        annuity = cents(monthlyPayment(balance, next, months - k + 1));
      }
      rate = next;
      rM = rate / 12;
    }
    const interestDue = cents(balance * rM);

    if (k <= d) {
      if (dType === 'total') {
        // Nothing paid: interest is capitalised.
        balance = cents(balance + interestDue);
        rows.push({ k, payment: 0, interest: 0, capital: 0, insurance, balance, accrued: interestDue });
      } else {
        rows.push({ k, payment: interestDue, interest: interestDue, capital: 0, insurance, balance });
      }
      continue;
    }
    if (k === d + 1) {
      const left = months - d;
      annuity = cents(monthlyPayment(balance, rate, left));
      linearCapital = cents(balance / left);
    }

    let capital: number;
    const fixed = opts.paymentFor?.(k);
    if (k === months) capital = balance;
    else if (fixed !== undefined) capital = cents(fixed - interestDue);
    else if (amort === 'linear') capital = linearCapital;
    else if (amort === 'inFine') capital = 0;
    else capital = cents(annuity - interestDue);
    capital = Math.min(capital, balance);

    balance = cents(balance - capital);
    rows.push({ k, payment: cents(interestDue + capital), interest: interestDue, capital: cents(capital), insurance, balance: Math.max(0, balance) });
  }
  return rows;
}

/** Add schedules month by month (e.g. main loan + PTZ). */
export function combine(a: Row[], b: Row[]): Row[] {
  const n = Math.max(a.length, b.length);
  const out: Row[] = [];
  for (let i = 0; i < n; i++) {
    const x = a[i], y = b[i];
    const add = (f: 'payment' | 'interest' | 'capital' | 'insurance' | 'balance') => cents((x?.[f] ?? 0) + (y?.[f] ?? 0));
    out.push({
      k: i + 1,
      payment: add('payment'), interest: add('interest'), capital: add('capital'), insurance: add('insurance'), balance: add('balance'),
      accrued: cents((x?.accrued ?? 0) + (y?.accrued ?? 0)) || undefined,
      ptz: y ? cents(y.payment + y.insurance) : undefined,
    });
  }
  return out;
}

export function byYear(rows: Row[]): YearRow[] {
  const out: YearRow[] = [];
  for (const r of rows) {
    const i = Math.floor((r.k - 1) / 12);
    const y = (out[i] ??= { year: i + 1, payment: 0, interest: 0, capital: 0, insurance: 0, balance: 0 });
    y.payment += r.payment;
    y.interest += r.interest + (r.accrued ?? 0);
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
