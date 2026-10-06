import type { AffiliateProfile, Balance, IncomeReport, LedgerEntry, Referral, RejectedInvoice } from '../types';
import { MONTHS_LONG } from '../utils/format';
import { INVOICE_MAX_BYTES, MIN_WITHDRAWAL, PF_INSS_RATE } from './rules';
import { demo } from './demo';

/*
 * Todas as leituras e gravações do painel passam por aqui, como no fidz-admin. Hoje elas usam o
 * estado de exemplo de ./demo; quando o schema dos afiliados existir, cada função vira uma query
 * ou RPC do Supabase com o mesmo retorno, e as telas não mudam.
 */

const wait = <T,>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(structuredClone(value)), 200));

export async function fetchProfile(): Promise<AffiliateProfile> {
  return wait(demo.profile);
}

export async function fetchBalance(): Promise<Balance> {
  return wait(demo.balance);
}

export async function fetchLedger(): Promise<LedgerEntry[]> {
  return wait(demo.ledger);
}

export async function fetchReferrals(): Promise<Referral[]> {
  return wait(demo.referrals);
}

export async function fetchRejectedInvoice(): Promise<RejectedInvoice | null> {
  return wait(demo.rejectedInvoice);
}

export async function fetchIncomeYears(): Promise<number[]> {
  return wait([new Date().getFullYear()]);
}

export async function fetchIncomeReport(year: number): Promise<IncomeReport> {
  const since = new Date(demo.profile.since);
  const now = new Date();
  const firstMonth = since.getFullYear() === year ? since.getMonth() + 1 : 1;
  const lastMonth = now.getFullYear() === year ? now.getMonth() + 1 : 12;
  const months = [];
  for (let m = firstMonth; m <= lastMonth; m++) {
    const row = demo.incomeMonths.find((r) => r.month === m);
    months.push({ month: m, gross: row?.gross ?? 0, withheld: row?.withheld ?? 0 });
  }
  return wait({ year, months, finalReportDate: `${year + 1}-02-27`, isFinal: year < now.getFullYear() });
}

export function validateInvoice(file: File): string | null {
  if (!/\.(pdf|xml)$/i.test(file.name)) return 'Envie a nota em PDF ou XML.';
  if (file.size > INVOICE_MAX_BYTES) return 'A nota precisa ter até 5 MB.';
  return null;
}

export interface WithdrawalResult {
  gross: number;
  net: number;
}

/** O saque é sempre do saldo disponível inteiro. PJ manda a nota fiscal junto. */
export async function requestWithdrawal({ invoice }: { invoice: File | null }): Promise<WithdrawalResult> {
  const pj = demo.profile.personType === 'PJ';
  const gross = demo.balance.available;
  if (gross < MIN_WITHDRAWAL) throw new Error('Saque a partir de R$ 30.');
  if (pj && !invoice) throw new Error('Anexe a nota fiscal.');
  if (invoice) {
    const error = validateInvoice(invoice);
    if (error) throw new Error(error);
  }
  demo.ledger = demo.ledger.map((l) => (l.status === 'available' ? { ...l, status: 'withdrawn' } : l));
  demo.ledger.unshift({
    id: `w${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    kind: 'withdrawal',
    store: null,
    description: `Pix para ${demo.profile.pixKeyMasked}`,
    status: pj ? 'invoice_review' : 'processing',
    releasesAt: null,
    amount: -gross
  });
  demo.balance = { ...demo.balance, available: 0, withdrawn: demo.balance.withdrawn + gross };
  return wait({ gross, net: pj ? gross : gross * (1 - PF_INSS_RATE) });
}

export async function resubmitInvoice({ invoice }: { invoice: File }): Promise<void> {
  const error = validateInvoice(invoice);
  if (error) throw new Error(error);
  const rejected = demo.rejectedInvoice;
  if (!rejected) return;
  demo.rejectedInvoice = { ...rejected, resubmitted: true };
  demo.ledger = demo.ledger.map((l) => (l.id === rejected.withdrawalId ? { ...l, status: 'invoice_review' } : l));
  return wait(undefined);
}

export function monthName(month: number) {
  return MONTHS_LONG[month - 1];
}
