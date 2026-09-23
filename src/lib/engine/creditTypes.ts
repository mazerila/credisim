import type { CreditType, Inputs } from './types';

export interface CreditTypeSpec {
  /** Loan amount is derived from a price and a down payment (true) or entered directly. */
  fromPrice: boolean;
  /** Which optional components make sense for this type. */
  components: Array<'insurance' | 'guarantee' | 'fileFee' | 'brokerFee' | 'notary' | 'works' | 'otherLoans'>;
  months: { min: number; max: number; step: number };
  /** Duration shown in years (mortgage) or months (consumer). */
  durationUnit: 'years' | 'months';
  rate: { min: number; max: number; step: number };
  /** Fees financed inside the loan (mortgage) or paid upfront (consumer). */
  feesFinanced: boolean;
  hcsf: boolean;
}

export const CREDIT_TYPES: Record<CreditType, CreditTypeSpec> = {
  mortgage: {
    fromPrice: true,
    components: ['insurance', 'guarantee', 'fileFee', 'brokerFee', 'notary', 'works', 'otherLoans'],
    months: { min: 12, max: 360, step: 12 },
    durationUnit: 'years',
    rate: { min: 0, max: 8, step: 0.05 },
    feesFinanced: true,
    hcsf: true,
  },
  personal: {
    fromPrice: false,
    components: ['insurance', 'fileFee', 'otherLoans'],
    months: { min: 3, max: 120, step: 3 },
    durationUnit: 'months',
    rate: { min: 0, max: 24, step: 0.1 },
    feesFinanced: false,
    hcsf: false,
  },
  car: {
    fromPrice: true,
    components: ['insurance', 'fileFee', 'otherLoans'],
    months: { min: 3, max: 120, step: 3 },
    durationUnit: 'months',
    rate: { min: 0, max: 24, step: 0.1 },
    feesFinanced: false,
    hcsf: false,
  },
  works: {
    fromPrice: false,
    components: ['insurance', 'fileFee', 'otherLoans'],
    months: { min: 12, max: 240, step: 6 },
    durationUnit: 'months',
    rate: { min: 0, max: 24, step: 0.1 },
    feesFinanced: false,
    hcsf: false,
  },
};

const base: Inputs = {
  type: 'mortgage',
  price: 320000,
  downPayment: 50000,
  propertyKind: 'old',
  firstTimeBuyer: false,
  transferTaxZone: 'raised',
  notaryAuto: true,
  notaryPct: 7.5,
  works: 15000,
  amount: 15000,
  rate: 3.2,
  months: 300,
  useInsurance: true,
  useGuarantee: true,
  useFileFee: true,
  useBrokerFee: false,
  useNotary: true,
  useWorks: false,
  useOtherLoans: false,
  insuranceRate: 0.3,
  insuranceBase: 'initial',
  insuranceCover: 100,
  guarantee: 'caution',
  guaranteeAuto: true,
  guaranteeAmount: 2500,
  fileFee: 1000,
  brokerFee: 2500,
  income: 6200,
  otherLoans: 300,
};

/** Realistic example values per credit type (Sept 2026 market). */
export const DEFAULTS: Record<CreditType, Inputs> = {
  mortgage: base,
  personal: { ...base, type: 'personal', amount: 15000, rate: 5.9, months: 60, useInsurance: false, insuranceRate: 0.6, useFileFee: false, fileFee: 150, income: 3200 },
  car: { ...base, type: 'car', price: 28000, downPayment: 6000, rate: 5.5, months: 60, useInsurance: false, insuranceRate: 0.6, useFileFee: false, fileFee: 150, income: 3200 },
  works: { ...base, type: 'works', amount: 30000, rate: 5.9, months: 96, useInsurance: true, insuranceRate: 0.4, useFileFee: false, fileFee: 300, income: 4200 },
};
