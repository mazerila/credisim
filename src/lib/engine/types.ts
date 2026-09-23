export type CreditType = 'mortgage' | 'personal' | 'car' | 'works';
export type InsuranceBase = 'initial' | 'remaining';
export type GuaranteeKind = 'caution' | 'hypo' | 'ppd';
export type PropertyKind = 'old' | 'new';
export type TransferTaxZone = 'raised' | 'standard' | 'indre';

/** Everything the user can enter. Money in euros, rates in percent (3.2 = 3.2 %). */
export interface Inputs {
  type: CreditType;

  // Project (mortgage, car)
  price: number;
  downPayment: number;
  propertyKind: PropertyKind;
  firstTimeBuyer: boolean;
  transferTaxZone: TransferTaxZone;
  notaryAuto: boolean;
  notaryPct: number;
  works: number;

  // Direct amount (personal, works loans; home loan in amount-only mode)
  amount: number;
  /** Home loan only: simulate a loan amount directly, without price or down payment. */
  amountOnly: boolean;

  // Loan
  rate: number;
  months: number;

  // Optional components: each can be switched off
  useInsurance: boolean;
  useGuarantee: boolean;
  useFileFee: boolean;
  useBrokerFee: boolean;
  useNotary: boolean;
  useWorks: boolean;
  useOtherLoans: boolean;

  insuranceRate: number;
  insuranceBase: InsuranceBase;
  insuranceCover: number;
  guarantee: GuaranteeKind;
  /** Estimate the guarantee from its type (true) or use guaranteeAmount (false). */
  guaranteeAuto: boolean;
  guaranteeAmount: number;
  fileFee: number;
  brokerFee: number;

  // Household
  income: number;
  otherLoans: number;
}

export interface Row {
  /** 1-based month number */
  k: number;
  payment: number;
  interest: number;
  capital: number;
  insurance: number;
  balance: number;
}

export interface YearRow {
  year: number;
  payment: number;
  interest: number;
  capital: number;
  insurance: number;
  balance: number;
}

export type UsuryCategory =
  | 'fixedUnder10y' | 'fixed10to20y' | 'fixed20yPlus'
  | 'upTo3000' | 'upTo6000' | 'above6000';

export interface Check {
  ok: boolean;
  limit: number;
  value: number;
}

export interface Result {
  principal: number;
  notary: number;
  guarantee: number;
  fees: number;
  works: number;
  projectTotal: number;
  rows: Row[];
  years: YearRow[];
  payment: number;
  insuranceMonthly: number;
  monthlyTotal: number;
  totalInterest: number;
  totalInsurance: number;
  /** interest + insurance + fees + guarantee */
  creditCost: number;
  taeg: number;
  /** TAEG components, in rate points */
  taegParts: { interest: number; insurance: number; fees: number };
  taea: number;
  usury: Check & { category: UsuryCategory; quarter: string; stale: boolean };
  debtRatio: Check | null;
  /** HCSF duration rule; mortgages only */
  duration: Check | null;
}
