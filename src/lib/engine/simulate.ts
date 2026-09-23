import { byYear, combine, principalFromPayment, schedule, type InsuranceSpec, type ScheduleOptions } from './annuity';
import { CREDIT_TYPES, usesProject } from './creditTypes';
import { guaranteeParams, notaryFees, RULES, usuryCategory, usuryLimit, usuryTable } from './rules';
import { ptzEstimate, type PtzEstimate } from './ptz';
import { actuarialRate } from './taeg';
import type { Inputs, PaymentPhase, Result, Row } from './types';

const on = (flag: boolean, v: number) => (flag ? Math.max(0, v) : 0);

export function notaryOf(i: Inputs): number {
  const spec = CREDIT_TYPES[i.type];
  if (i.type !== 'mortgage' || i.amountOnly || !i.useNotary || !spec.components.includes('notary')) return 0;
  return i.notaryAuto
    ? notaryFees(i.price, i.propertyKind, i.transferTaxZone, i.firstTimeBuyer)
    : (i.price * i.notaryPct) / 100;
}

export interface Funding {
  /** main loan */
  principal: number;
  /** PTZ amount (0 when not used) */
  ptz: number;
  ptzEstimate: PtzEstimate | null;
  notary: number;
  guarantee: number;
  fees: number;
  works: number;
}

/**
 * Amounts to borrow. For a home loan built from a project, the total borrowed is
 * everything the project costs minus the down payment, including the guarantee,
 * whose cost itself depends on the amount (closed form: B = (base + fixed) / (1 − rate)).
 * A PTZ then replaces part of it; it can never exceed the other loans (so at most half).
 */
export function principalOf(i: Inputs): Funding {
  const spec = CREDIT_TYPES[i.type];
  const has = (c: (typeof spec.components)[number]) => spec.components.includes(c);
  const fees = on(i.useFileFee && has('fileFee'), i.fileFee) + on(i.useBrokerFee && has('brokerFee'), i.brokerFee);
  const notary = notaryOf(i);
  const none = { ptz: 0, ptzEstimate: null };

  if (!usesProject(i)) {
    // Amount typed directly: fees and guarantee are paid on top, not financed.
    const principal = Math.max(0, Math.round(i.amount));
    let guarantee = 0;
    if (i.useGuarantee && has('guarantee') && principal > 0) {
      const g = guaranteeParams(i.guarantee);
      guarantee = i.guaranteeAuto ? principal * g.rate + g.fixed : Math.max(0, i.guaranteeAmount);
    }
    return { principal, notary: 0, guarantee, fees, works: 0, ...none };
  }
  const works = on(i.useWorks && has('works'), i.works);
  const base = i.price + notary + works + (spec.feesFinanced ? fees : 0) - i.downPayment;
  if (base <= 0) return { principal: 0, notary, guarantee: 0, fees, works, ...none };

  let total = Math.round(base);
  let guarantee = 0;
  if (i.useGuarantee && has('guarantee')) {
    if (i.guaranteeAuto) {
      const g = guaranteeParams(i.guarantee);
      total = Math.round((base + g.fixed) / (1 - g.rate));
      guarantee = total * g.rate + g.fixed;
    } else {
      guarantee = Math.max(0, i.guaranteeAmount);
      total = Math.round(base + guarantee);
    }
  }

  let ptz = 0;
  let ptzEst: PtzEstimate | null = null;
  if (i.usePtz && has('ptz')) {
    ptzEst = ptzEstimate(i.ptzZone, i.ptzKind, i.persons, i.taxIncome, i.price + works);
    const wanted = i.ptzAuto ? (ptzEst.eligible ? ptzEst.amount : 0) : Math.max(0, Math.round(i.ptzAmount));
    ptz = Math.min(wanted, Math.floor(total / 2));
  }
  return { principal: total - ptz, ptz, ptzEstimate: ptzEst, notary, guarantee, fees, works };
}

function variableSummary(
  i: Inputs, path: (year: number) => number, principal: number, initialRate: number,
  ins: InsuranceSpec[], opts: ScheduleOptions, rows: Row[], flat: Row[],
): NonNullable<Result['variable']> {
  const years = Math.ceil(i.months / 12);
  const yearRates = Array.from({ length: years }, (_, y) => path(y));
  const cost = (rs: Row[]) => rs.reduce((s, r) => s + r.interest + (r.accrued ?? 0) + r.insurance, 0);
  let worstMonthly: number | null = null;
  if (i.rateType === 'capped') {
    const top = initialRate + i.cap / 100;
    const worst = schedule(principal, initialRate, i.months, ins, { ...opts, rateFor: (k) => (k <= 12 ? initialRate : top) });
    worstMonthly = Math.max(...worst.map((r) => r.payment + r.insurance));
  }
  return {
    initialRate,
    maxRate: Math.max(...yearRates),
    yearRates,
    maxMonthly: Math.max(...rows.map((r) => r.payment + r.insurance)),
    costIfStable: cost(flat),
    worstMonthly,
  };
}

export function insuranceSpecs(i: Inputs): InsuranceSpec[] {
  const spec = CREDIT_TYPES[i.type];
  if (!i.useInsurance || !spec.components.includes('insurance')) return [];
  const list: InsuranceSpec[] = [{ rate: i.insuranceRate / 100, base: i.insuranceBase, cover: i.insuranceCover / 100 }];
  if (i.borrowers >= 2) list.push({ rate: i.insuranceRate2 / 100, base: i.insuranceBase, cover: i.insuranceCover2 / 100 });
  return list;
}

/**
 * Smoothing (lissage): choose one total T so that main payment + PTZ payment stays
 * constant: main payment in month k = T − PTZ payment in month k, with T such that
 * the main loan is exactly repaid. Returns undefined if it would need a negative payment.
 */
export function smoothedTotal(principal: number, annualRate: number, months: number, ptzPayments: number[]): number | undefined {
  const r = annualRate / 12;
  let pvOnes = 0, pvPtz = 0;
  for (let k = 1; k <= months; k++) {
    const v = Math.pow(1 + r, -k);
    pvOnes += v;
    pvPtz += (ptzPayments[k - 1] ?? 0) * v;
  }
  const T = (principal + pvPtz) / pvOnes;
  const minMain = Math.min(...Array.from({ length: months }, (_, k) => T - (ptzPayments[k] ?? 0)));
  return minMain > 0 ? T : undefined;
}

/** Group months with the same outgoings into steps, e.g. "€1,400 for 8 years, then €1,250". */
function phasesOf(rows: Row[], skipLast: boolean): PaymentPhase[] {
  const out: PaymentPhase[] = [];
  const list = skipLast ? rows.slice(0, -1) : rows;
  for (const r of list) {
    const total = r.payment + r.insurance;
    const last = out[out.length - 1];
    if (last && Math.abs(last.amount - total) < 1) last.to = r.k;
    else out.push({ from: r.k, to: r.k, amount: total });
  }
  // The final month only absorbs rounding: fold it into the previous step.
  const tail = out[out.length - 1];
  if (out.length > 1 && tail.from === tail.to && Math.abs(out[out.length - 2].amount - tail.amount) < 5) {
    out.pop();
    out[out.length - 1].to = tail.to;
  }
  return out;
}

const SCENARIO_SHIFT = { down1: -1, stable: 0, up1: 1, up2: 2, up3: 3 } as const;

/**
 * Variable / capped rate path: index + margin, revised every year. The index moves
 * by the scenario's shift over the first two years, then stays there. A cap limits the
 * move from the initial rate (both ways). Rates never go below 0.
 */
export function variableRatePath(i: Inputs): ((year: number) => number) | null {
  if (i.type !== 'mortgage' || i.rateType === 'fixed') return null;
  const initial = (i.indexRate + i.margin) / 100;
  const shift = SCENARIO_SHIFT[i.scenario] / 100;
  return (year: number) => {
    let rate = (i.indexRate / 100) + shift * Math.min(year, 2) / 2 + i.margin / 100;
    if (i.rateType === 'capped') rate = Math.min(initial + i.cap / 100, Math.max(initial - i.cap / 100, rate));
    return Math.max(0, rate);
  };
}

export function simulate(i: Inputs, today = new Date()): Result {
  const spec = CREDIT_TYPES[i.type];
  const f = principalOf(i);
  const { principal, notary, guarantee, fees, works } = f;
  const path = variableRatePath(i);
  const rate = path ? path(0) : i.rate / 100;
  const ins = insuranceSpecs(i);
  const homeLoan = i.type === 'mortgage';
  const deferralMonths = homeLoan && i.deferralType !== 'none' ? i.deferralMonths : 0;
  const opts: ScheduleOptions = homeLoan ? { amortization: i.amortization, deferralType: i.deferralType, deferralMonths } : {};

  // PTZ: 0 %, nothing to repay during its deferral, then constant capital.
  let ptzRows: Row[] = [];
  if (f.ptz > 0 && f.ptzEstimate) {
    const est = f.ptzEstimate;
    const total = est.totalMonths || 120;
    ptzRows = schedule(f.ptz, 0, total, ins, { amortization: 'linear', deferralType: est.deferralMonths ? 'partial' : 'none', deferralMonths: est.deferralMonths });
  }

  let smoothingApplied = false;
  let mainOpts = opts;
  if (i.smoothing && ptzRows.length && !path && (!homeLoan || (i.amortization === 'annuity' && deferralMonths === 0))) {
    const T = smoothedTotal(principal, rate, i.months, ptzRows.map((r) => r.payment));
    if (T !== undefined) {
      smoothingApplied = true;
      mainOpts = { ...opts, paymentFor: (k: number) => T - (ptzRows[k - 1]?.payment ?? 0) };
    }
  }

  if (path) mainOpts = { ...mainOpts, rateFor: (k: number) => path(Math.floor((k - 1) / 12)) };
  const mainRows = schedule(principal, rate, i.months, ins, mainOpts);
  // The TAEG of a variable-rate loan is computed as if the initial rate never changed (EU rule).
  const flatRows = path ? schedule(principal, rate, i.months, ins, opts) : mainRows;
  const rows = ptzRows.length ? combine(mainRows, ptzRows) : mainRows;

  const totalInterest = mainRows.reduce((s, r) => s + r.interest + (r.accrued ?? 0), 0);
  const totalInsurance = rows.reduce((s, r) => s + r.insurance, 0);
  const inFine = homeLoan && i.amortization === 'inFine';
  const regular = inFine ? rows.slice(0, -1) : rows;
  const totals = regular.map((r) => r.payment + r.insurance);
  const monthlyTotal = totals[0] ?? 0;
  const monthlyMax = totals.length ? Math.max(...totals) : 0;
  const phases = phasesOf(rows, inFine);

  // TAEG of the main loan (upfront costs belong to it): the figure checked against usury.
  const upfront = fees + guarantee;
  const mainFlows = flatRows.map((r) => r.payment + r.insurance);
  const taeg = actuarialRate(principal - upfront, mainFlows);
  const taegNoFees = actuarialRate(principal, mainFlows);
  const interestPart = principal > 0 ? actuarialRate(principal, flatRows.map((r) => r.payment)) : 0;
  const taegParts = {
    interest: interestPart,
    insurance: Math.max(0, taegNoFees - interestPart),
    fees: Math.max(0, taeg - taegNoFees),
  };
  const taegGlobal = ptzRows.length ? actuarialRate(principal + f.ptz - upfront, rows.map((r) => r.payment + r.insurance)) : taeg;

  const { table, stale } = usuryTable(today);
  const category = usuryCategory(i.type, principal, i.months, !!path);
  const limit = usuryLimit(category, table);

  const other = on(i.useOtherLoans && spec.components.includes('otherLoans'), i.otherLoans);
  const ratio = i.income > 0 ? (monthlyMax + other) / i.income : 0;
  const maxMonths = RULES.hcsf.maxYears * 12 + (homeLoan && i.propertyKind === 'new' && deferralMonths > 0 ? Math.min(deferralMonths, 24) : 0);
  const left = i.income - monthlyMax - other;

  return {
    principal, notary, guarantee, fees, works,
    ptz: f.ptz > 0 && f.ptzEstimate ? { amount: f.ptz, estimate: f.ptzEstimate, rows: ptzRows } : null,
    ptzEstimate: f.ptzEstimate,
    totalBorrowed: principal + f.ptz,
    projectTotal: usesProject(i) ? i.price + notary + works + fees + guarantee : principal + fees + guarantee,
    rows,
    mainRows,
    years: byYear(rows),
    payment: rows[0]?.payment ?? 0,
    insuranceMonthly: rows[0]?.insurance ?? 0,
    monthlyTotal, monthlyMax, phases, smoothingApplied,
    totalInterest, totalInsurance,
    creditCost: totalInterest + totalInsurance + fees + guarantee,
    taeg, taegParts, taegGlobal,
    taea: taegParts.insurance,
    usury: { ok: taeg <= limit, limit, value: taeg, category, quarter: table.quarter, stale },
    debtRatio: i.income > 0 ? { ok: ratio <= RULES.hcsf.maxDebtRatio, limit: RULES.hcsf.maxDebtRatio, value: ratio } : null,
    duration: spec.hcsf ? { ok: i.months <= maxMonths, limit: maxMonths, value: i.months } : null,
    variable: path ? variableSummary(i, path, principal, rate, ins, opts, mainRows, flatRows) : null,
    moneyLeft: i.income > 0 ? { total: left, perPerson: left / Math.max(1, i.persons) } : null,
  };
}

/**
 * Borrowing capacity: the largest principal whose payment + insurance keeps the
 * debt ratio at the limit. Insurance on remaining capital is approximated by its
 * first (highest) month, which keeps the estimate on the safe side.
 */
export function borrowingCapacity(i: Inputs, maxRatio = RULES.hcsf.maxDebtRatio): number {
  const spec = CREDIT_TYPES[i.type];
  const other = on(i.useOtherLoans && spec.components.includes('otherLoans'), i.otherLoans);
  const budget = i.income * maxRatio - other;
  if (budget <= 0) return 0;
  const insPerEuro = insuranceSpecs(i).reduce((s, x) => s + (x.rate * x.cover) / 12, 0);
  // payment(C) + C·insPerEuro = budget, payment linear in C
  const perEuro = principalFromPayment(1, i.rate / 100, i.months);
  return Math.max(0, Math.floor(budget / (1 / perEuro + insPerEuro)));
}
