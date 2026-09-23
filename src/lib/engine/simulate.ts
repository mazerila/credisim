import { byYear, principalFromPayment, schedule } from './annuity';
import { CREDIT_TYPES } from './creditTypes';
import { guaranteeParams, notaryFees, RULES, usuryCategory, usuryLimit, usuryTable } from './rules';
import { actuarialRate, nominalToActuarial } from './taeg';
import type { Inputs, Result } from './types';

const on = (flag: boolean, v: number) => (flag ? Math.max(0, v) : 0);

export function notaryOf(i: Inputs): number {
  const spec = CREDIT_TYPES[i.type];
  if (i.type !== 'mortgage' || !i.useNotary || !spec.components.includes('notary')) return 0;
  return i.notaryAuto
    ? notaryFees(i.price, i.propertyKind, i.transferTaxZone, i.firstTimeBuyer)
    : (i.price * i.notaryPct) / 100;
}

/**
 * Amount to borrow. For a mortgage it is everything the project costs minus the
 * down payment, including the guarantee, whose cost itself depends on the amount
 * (solved in closed form: C = (base + fixed) / (1 − rate)).
 */
export function principalOf(i: Inputs): { principal: number; notary: number; guarantee: number; fees: number; works: number } {
  const spec = CREDIT_TYPES[i.type];
  const has = (c: (typeof spec.components)[number]) => spec.components.includes(c);
  const fees = on(i.useFileFee && has('fileFee'), i.fileFee) + on(i.useBrokerFee && has('brokerFee'), i.brokerFee);
  const works = on(i.useWorks && has('works'), i.works);
  const notary = notaryOf(i);

  if (!spec.fromPrice) {
    return { principal: Math.max(0, Math.round(i.amount)), notary: 0, guarantee: 0, fees, works: 0 };
  }
  const base = i.price + notary + works + (spec.feesFinanced ? fees : 0) - i.downPayment;
  if (base <= 0) return { principal: 0, notary, guarantee: 0, fees, works };

  if (i.useGuarantee && has('guarantee') && !i.guaranteeAuto) {
    const guarantee = Math.max(0, i.guaranteeAmount);
    return { principal: Math.round(base + guarantee), notary, guarantee, fees, works };
  }
  if (i.useGuarantee && has('guarantee')) {
    const g = guaranteeParams(i.guarantee);
    const principal = Math.round((base + g.fixed) / (1 - g.rate));
    return { principal, notary, guarantee: principal * g.rate + g.fixed, fees, works };
  }
  return { principal: Math.round(base), notary, guarantee: 0, fees, works };
}

export function simulate(i: Inputs, today = new Date()): Result {
  const spec = CREDIT_TYPES[i.type];
  const { principal, notary, guarantee, fees, works } = principalOf(i);
  const rate = i.rate / 100;
  const insured = i.useInsurance && spec.components.includes('insurance');
  const ins = insured ? { rate: i.insuranceRate / 100, base: i.insuranceBase, cover: i.insuranceCover / 100 } : undefined;
  const rows = schedule(principal, rate, i.months, ins);

  const sum = (f: 'interest' | 'insurance') => rows.reduce((s, r) => s + r[f], 0);
  const totalInterest = sum('interest');
  const totalInsurance = sum('insurance');
  const payment = rows[0]?.payment ?? 0;
  const insuranceMonthly = rows[0]?.insurance ?? 0;
  const monthlyTotal = payment + insuranceMonthly;

  // TAEG: upfront costs reduce the net amount; insurance adds to each flow.
  const upfront = fees + guarantee;
  const withIns = rows.map((r) => r.payment + r.insurance);
  const taeg = actuarialRate(principal - upfront, withIns);
  const taegNoFees = actuarialRate(principal, withIns);
  const interestPart = principal > 0 ? nominalToActuarial(rate) : 0;
  const taegParts = {
    interest: interestPart,
    insurance: Math.max(0, taegNoFees - interestPart),
    fees: Math.max(0, taeg - taegNoFees),
  };

  const { table, stale } = usuryTable(today);
  const category = usuryCategory(i.type, principal, i.months);
  const limit = usuryLimit(category, table);

  const other = on(i.useOtherLoans && spec.components.includes('otherLoans'), i.otherLoans);
  const ratio = i.income > 0 ? (monthlyTotal + other) / i.income : 0;

  return {
    principal, notary, guarantee, fees, works,
    projectTotal: spec.fromPrice ? i.price + notary + works + fees + guarantee : principal + fees,
    rows,
    years: byYear(rows),
    payment, insuranceMonthly, monthlyTotal,
    totalInterest, totalInsurance,
    creditCost: totalInterest + totalInsurance + fees + guarantee,
    taeg, taegParts,
    taea: taegParts.insurance,
    usury: { ok: taeg <= limit, limit, value: taeg, category, quarter: table.quarter, stale },
    debtRatio: i.income > 0 ? { ok: ratio <= RULES.hcsf.maxDebtRatio, limit: RULES.hcsf.maxDebtRatio, value: ratio } : null,
    duration: spec.hcsf ? { ok: i.months <= RULES.hcsf.maxYears * 12, limit: RULES.hcsf.maxYears * 12, value: i.months } : null,
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
  const insured = i.useInsurance && spec.components.includes('insurance');
  const insPerEuro = insured ? (i.insuranceRate / 100) * (i.insuranceCover / 100) / 12 : 0;
  // payment(C) + C·insPerEuro = budget, payment linear in C
  const perEuro = principalFromPayment(1, i.rate / 100, i.months);
  return Math.max(0, Math.floor(budget / (1 / perEuro + insPerEuro)));
}
