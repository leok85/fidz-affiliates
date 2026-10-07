export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'purple' | 'info';

export type PersonType = 'PF' | 'PJ';

export type AffiliateAccess = { status: 'active'; profile: AffiliateProfile } | { status: 'disabled' | 'missing' };

export interface AffiliateProfile {
  name: string;
  email: string;
  code: string;
  link: string;
  personType: PersonType;
  /** ISO date the affiliate joined the program. */
  since: string;
  /** Masked CPF (PF) or CNPJ (PJ). */
  documentMasked: string;
  pixKeyMasked: string;
}

/** 'late': the store stopped paying (past due, at risk or blocked for non-payment) but didn't cancel. */
export type ReferralStatus = 'active' | 'trial' | 'late' | 'completed' | 'canceled';
export type ReferralPlan = 'monthly' | 'yearly';

export interface Referral {
  id: string;
  store: string;
  signedUpAt: string;
  via: 'link' | 'code';
  plan: ReferralPlan;
  status: ReferralStatus;
  /** Monthly plans: how many of the 12 commissioned installments were paid. */
  paidInstallments: number;
  earned: number;
}

export type LedgerStatus =
  | 'grace'
  | 'available'
  | 'withdrawn'
  | 'paid'
  | 'processing'
  | 'invoice_review'
  | 'invoice_rejected';

export interface LedgerEntry {
  id: string;
  date: string;
  kind: 'commission' | 'withdrawal';
  store: string | null;
  /** Commissions only; withdrawals show the affiliate's Pix key. */
  description: string;
  status: LedgerStatus;
  /** Commissions in grace: when they become available. */
  releasesAt: string | null;
  amount: number;
}

export interface Balance {
  available: number;
  grace: number;
  withdrawn: number;
}

export interface RejectedInvoice {
  withdrawalId: string;
  amount: number;
  reason: string;
  resubmitted: boolean;
}

export interface GoalTier {
  level: number;
  name: string;
  points: number;
  prize: string | null;
}

export interface IncomeReportMonth {
  month: number;
  gross: number;
  withheld: number;
}

export interface IncomeReport {
  year: number;
  months: IncomeReportMonth[];
  finalReportDate: string;
  isFinal: boolean;
}

export interface Caption {
  where: string;
  text: string;
}
