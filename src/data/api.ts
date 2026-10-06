import type { AffiliateAccess, AffiliateProfile, Balance, IncomeReport, LedgerEntry, PersonType, Referral, RejectedInvoice } from '../types';
import { supabase } from '../lib/supabaseClient';
import { MONTHS_LONG } from '../utils/format';
import { INVOICE_MAX_BYTES, MIN_WITHDRAWAL, PF_INSS_RATE } from './rules';
import { demo } from './demo';

/*
 * Todas as leituras e gravações do painel passam por aqui, como no fidz-admin. O cadastro vem de
 * public.affiliates; o resto ainda usa o estado de exemplo de ./demo, até o schema de indicações,
 * comissões e saques existir. Cada função dessas vira uma query ou RPC com o mesmo retorno.
 */

const wait = <T,>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(structuredClone(value)), 200));

/** "···.482.019-··" / "12.···.···/0001-··": only the middle of the CPF, the root of the CNPJ. */
function maskDocument(personType: PersonType, digits: string) {
  if (personType === 'PF') return `CPF ···.${digits.slice(3, 6)}.${digits.slice(6, 9)}-··`;
  return `CNPJ ${digits.slice(0, 2)}.···.···/${digits.slice(8, 12)}-··`;
}

/** The signed-in user's affiliate row (RLS: user_id = auth.uid()). */
export async function fetchAffiliateAccess(): Promise<AffiliateAccess> {
  const { data, error } = await supabase
    .from('affiliates')
    .select('name, email, code, person_type, cpf, cnpj, status, created_at')
    .maybeSingle();
  if (error) throw error;
  if (!data) return { status: 'missing' };
  if (data.status !== 'active') return { status: 'disabled' };
  const personType = data.person_type as PersonType;
  const document = maskDocument(personType, (personType === 'PF' ? data.cpf : data.cnpj) ?? '');
  const profile: AffiliateProfile = {
    name: data.name,
    email: data.email,
    code: data.code,
    link: `fidz.com.br/r/${String(data.code).toLowerCase()}`,
    personType,
    since: data.created_at,
    documentMasked: document,
    // Termos, seção 2: a chave Pix é o CPF ou CNPJ do cadastro.
    pixKeyMasked: document
  };
  return { status: 'active', profile };
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

export async function fetchIncomeReport(year: number, sinceIso: string): Promise<IncomeReport> {
  const since = new Date(sinceIso);
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
export async function requestWithdrawal({ invoice, personType }: { invoice: File | null; personType: PersonType }): Promise<WithdrawalResult> {
  const pj = personType === 'PJ';
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
    description: '',
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
