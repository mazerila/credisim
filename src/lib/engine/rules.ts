import usuryData from '../data/fr/usury.json';
import rules from '../data/fr/rules.json';
import type { CreditType, GuaranteeKind, PropertyKind, TransferTaxZone, UsuryCategory } from './types';

export const RULES = rules;
export const USURY_SOURCE = usuryData.source;

type Quarter = (typeof usuryData.quarters)[number];

/** The usury table valid on `date`; if none is, the most recent one, flagged as stale. */
export function usuryTable(date = new Date()): { table: Quarter; stale: boolean } {
  const iso = date.toISOString().slice(0, 10);
  const sorted = [...usuryData.quarters].sort((a, b) => b.validFrom.localeCompare(a.validFrom));
  const current = sorted.find((q) => q.validFrom <= iso && iso <= q.validTo);
  return current ? { table: current, stale: false } : { table: sorted[0], stale: true };
}

/**
 * Which usury band applies. Consumer credit (personal, car, works ≤ €75k) uses
 * amount bands; mortgages and works loans above €75k use duration bands.
 */
export function usuryCategory(type: CreditType, principal: number, months: number): UsuryCategory {
  const mortgageLike = type === 'mortgage' || (type === 'works' && principal > rules.consumerCreditMaxForMortgageBands);
  if (mortgageLike) {
    if (months < 120) return 'fixedUnder10y';
    if (months < 240) return 'fixed10to20y';
    return 'fixed20yPlus';
  }
  if (principal <= 3000) return 'upTo3000';
  if (principal <= 6000) return 'upTo6000';
  return 'above6000';
}

export function usuryLimit(category: UsuryCategory, table: Quarter): number {
  return category in table.mortgage
    ? table.mortgage[category as keyof Quarter['mortgage']]
    : table.consumer[category as keyof Quarter['consumer']];
}

/** Regulated notary emoluments (sliding scale, excl. VAT). */
export function notaryEmoluments(price: number): number {
  let prev = 0, total = 0;
  for (const b of rules.notary.emolumentBrackets) {
    const top = b.upTo ?? Infinity;
    if (price > prev) total += (Math.min(price, top) - prev) * b.rate;
    prev = top;
  }
  return total;
}

/**
 * Estimated notary fees ("frais de notaire"): transfer taxes + emoluments (with VAT)
 * + property-security contribution + disbursements.
 * First-time buyers are exempt from the 2025–2028 departmental increase.
 */
export function notaryBreakdown(price: number, kind: PropertyKind, zone: TransferTaxZone, firstTimeBuyer: boolean) {
  const n = rules.notary;
  if (price <= 0) return { taxes: 0, emoluments: 0, other: 0, total: 0 };
  let tax: number;
  if (kind === 'new') tax = n.transferTax.newBuild;
  else if (zone === 'indre') tax = n.transferTax.indre;
  else if (zone === 'raised' && !firstTimeBuyer) tax = n.transferTax.raised;
  else tax = n.transferTax.standard;
  const taxes = price * tax;
  const emoluments = notaryEmoluments(price) * (1 + n.vat);
  const other = price * n.securityContribution + n.disbursements;
  return { taxes, emoluments, other, total: taxes + emoluments + other };
}

export function notaryFees(price: number, kind: PropertyKind, zone: TransferTaxZone, firstTimeBuyer: boolean): number {
  return notaryBreakdown(price, kind, zone, firstTimeBuyer).total;
}

export function guaranteeParams(kind: GuaranteeKind) {
  return rules.guarantee[kind];
}
