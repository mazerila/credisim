export type CreditType = 'mortgage' | 'personal' | 'car' | 'works';
export type InsuranceBase = 'initial' | 'remaining';
/** France: caution / hypothèque / PPD. Other countries: their usual mortgage deed or guarantee. */
export type GuaranteeKind = 'caution' | 'hypo' | 'ppd' | 'mortgage' | 'grundschuld' | 'valuation' | 'ipoteca' | 'nhg' | 'none';
export type Country = 'FR' | 'BE' | 'DE' | 'ES' | 'IT' | 'NL';
export type PropertyKind = 'old' | 'new';
export type TransferTaxZone = 'raised' | 'standard' | 'indre';
export type Amortization = 'annuity' | 'linear' | 'inFine';
export type DeferralType = 'none' | 'partial' | 'total';
export type PtzZone = 'A' | 'B1' | 'B2' | 'C';
export type RateType = 'fixed' | 'variable' | 'capped';
/** How the index moves in a variable-rate scenario, in points reached after 2 years. */
export type RateScenario = 'down1' | 'stable' | 'up1' | 'up2' | 'up3';
export type PtzKind = 'newFlat' | 'newHouse' | 'oldWithWorks';

/** Everything the user can enter. Money in euros, rates in percent (3.2 = 3.2 %). */
export interface Inputs {
  type: CreditType;
  /** Country preset: purchase costs, guarantee, rules. France has the most detailed rules. */
  country: Country;
  /** Country-specific region code (Belgian region, German Land, Spanish community…) */
  region: string;
  /** Buying your own main home (lower taxes in BE, IT, NL) */
  mainHome: boolean;

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
  /** Home loan: how capital is repaid, and an optional deferral at the start. */
  amortization: Amortization;
  deferralType: DeferralType;
  deferralMonths: number;

  /** Home loan rate type. Variable = index + margin, revised every year. */
  rateType: RateType;
  /** index (Euribor 12 months), % */
  indexRate: number;
  /** bank margin, % */
  margin: number;
  /** capped: maximum move from the initial rate, in points (both ways) */
  cap: number;
  scenario: RateScenario;

  // PTZ (home loan): eligibility inputs, amount, and smoothing of the main loan
  usePtz: boolean;
  ptzZone: PtzZone;
  ptzKind: PtzKind;
  /** household size (also used for money left per person) */
  persons: number;
  /** revenu fiscal de référence (N-2) of the household */
  taxIncome: number;
  ptzAuto: boolean;
  ptzAmount: number;
  smoothing: boolean;

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
  /** 2 = a second borrower with their own rate and coverage */
  borrowers: number;
  insuranceRate2: number;
  insuranceCover2: number;
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
  /** total deferral: interest added to the balance this month (not paid) */
  accrued?: number;
  /** combined schedules: the PTZ part of this month's outgoings (payment + insurance) */
  ptz?: number;
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
  | 'fixedUnder10y' | 'fixed10to20y' | 'fixed20yPlus' | 'variable'
  | 'upTo3000' | 'upTo6000' | 'above6000';

export interface Check {
  ok: boolean;
  limit: number;
  value: number;
}

export interface PaymentPhase {
  /** first and last month (1-based) */
  from: number;
  to: number;
  /** payment + insurance */
  amount: number;
}

export interface Result {
  /** main loan */
  principal: number;
  /** PTZ part, when used */
  ptz: { amount: number; estimate: import('./ptz').PtzEstimate; rows: Row[] } | null;
  /** eligibility result even when the PTZ amount ends up 0 */
  ptzEstimate: import('./ptz').PtzEstimate | null;
  totalBorrowed: number;
  notary: number;
  guarantee: number;
  fees: number;
  works: number;
  projectTotal: number;
  /** all loans combined */
  rows: Row[];
  mainRows: Row[];
  years: YearRow[];
  payment: number;
  insuranceMonthly: number;
  /** first month's outgoings (payment + insurance) */
  monthlyTotal: number;
  /** highest regular month (used for the debt ratio) */
  monthlyMax: number;
  phases: PaymentPhase[];
  smoothingApplied: boolean;
  totalInterest: number;
  totalInsurance: number;
  /** interest + insurance + fees + guarantee */
  creditCost: number;
  /** TAEG of the main loan (checked against usury) */
  taeg: number;
  /** TAEG of all loans together (equals taeg without PTZ) */
  taegGlobal: number;
  /** TAEG components, in rate points */
  taegParts: { interest: number; insurance: number; fees: number };
  taea: number;
  /** Legal maximum rate. `applies` is false where Credisim has no legal maximum to check (outside France). */
  usury: Check & { category: UsuryCategory; quarter: string; stale: boolean; applies: boolean };
  /** `law` (France, HCSF) or a usual bank `guideline` elsewhere */
  debtRatio: (Check & { kind: 'law' | 'guideline' }) | null;
  /** HCSF duration rule; mortgages only */
  duration: Check | null;
  /** variable / capped rate: what the scenario does to the loan */
  variable: {
    initialRate: number;
    maxRate: number;
    /** rate for each year of the loan */
    yearRates: number[];
    maxMonthly: number;
    /** interest + insurance if the rate stayed at its initial level */
    costIfStable: number;
    /** capped only: payment if the rate hits the cap from year 2 */
    worstMonthly: number | null;
  } | null;
  /** income − highest monthly outgoings − other loans */
  moneyLeft: { total: number; perPerson: number } | null;
}
