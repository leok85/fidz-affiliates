import type { AffiliateAccess, AffiliateProfile, Balance, IncomeReport, LedgerEntry, PersonType, Referral, RejectedInvoice } from '../types';
import { supabase } from '../lib/supabaseClient';
import { brl, MONTHS_LONG } from '../utils/format';
import { COMMISSIONED_INSTALLMENTS, INVOICE_MAX_BYTES, MIN_WITHDRAWAL } from './rules';
import { rpaTaxes, type MonthToDate, type RpaTaxes } from './taxes';
import { demo } from './demo';

/*
 * Todas as leituras e gravações do painel passam por aqui, como no fidz-admin. Cadastro, indicações,
 * comissões e saldo vêm do Supabase (public.affiliates e as RPCs get_affiliate_*, do fidz-client-admin).
 * Saque, nota recusada e informe do PF ainda usam o estado de exemplo de ./demo, até o saque existir.
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
  const { data, error } = await supabase.rpc('get_affiliate_balance').single();
  if (error) throw error;
  const row = data as { available: number; grace: number; withdrawn: number };
  return { available: Number(row.available), grace: Number(row.grace), withdrawn: Number(row.withdrawn) };
}

interface CommissionRow {
  id: number;
  paid_at: string;
  store: string;
  kind: 'first' | 'recurring' | 'reversal';
  installments: number;
  first_installment: number;
  amount: number;
  state: 'grace' | 'available' | 'canceled';
  releases_at: string;
}

/** Como cada comissão aparece no extrato (termos, seção 4: 1ª inteira, depois 10% até a 24ª). */
export function commissionDescription(c: Pick<CommissionRow, 'kind' | 'installments' | 'first_installment'>) {
  if (c.kind === 'reversal') return 'Estorno: o pagamento foi reembolsado';
  if (c.installments > 1) {
    const last = c.first_installment + c.installments - 1;
    return c.kind === 'first'
      ? `Anuidade · 1ª mensalidade inteira + 10% até a ${last}ª`
      : `Anuidade · 10% das mensalidades ${c.first_installment} a ${last}`;
  }
  return c.kind === 'first'
    ? '1ª mensalidade inteira'
    : `Mensalidade ${c.first_installment} de ${COMMISSIONED_INSTALLMENTS} · 10%`;
}

export async function fetchLedger(): Promise<LedgerEntry[]> {
  const { data, error } = await supabase.rpc('get_affiliate_commissions');
  if (error) throw error;
  return ((data ?? []) as CommissionRow[]).map((c) => ({
    id: `c${c.id}`,
    date: c.paid_at.slice(0, 10),
    kind: 'commission',
    store: c.store,
    description: commissionDescription(c),
    status: c.state,
    releasesAt: c.state === 'grace' ? c.releases_at.slice(0, 10) : null,
    amount: Number(c.amount)
  }));
}

interface ReferralRow {
  company_id: number;
  store: string;
  signed_up_at: string;
  via: 'link' | 'code';
  plan: 'monthly' | 'yearly' | null;
  status: Referral['status'];
  paid_installments: number;
  earned: number;
}

export async function fetchReferrals(): Promise<Referral[]> {
  const { data, error } = await supabase.rpc('get_affiliate_referrals');
  if (error) throw error;
  return ((data ?? []) as ReferralRow[]).map((r) => ({
    id: String(r.company_id),
    store: r.store,
    signedUpAt: r.signed_up_at.slice(0, 10),
    via: r.via,
    plan: r.plan ?? 'monthly',
    status: r.status,
    paidInstallments: r.paid_installments,
    earned: Number(r.earned)
  }));
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
    const paid = demo.rpas.filter((r) => r.paid && r.date.startsWith(`${year}-${String(m).padStart(2, '0')}`));
    months.push({
      month: m,
      gross: paid.reduce((sum, r) => sum + r.gross, 0),
      inss: paid.reduce((sum, r) => sum + r.inss, 0),
      irrf: paid.reduce((sum, r) => sum + r.irrf, 0)
    });
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

/** PF withdrawals already requested this month, so the INSS cap and IRRF base add up. */
function monthToDate(): MonthToDate {
  const month = new Date().toISOString().slice(0, 7);
  const rows = demo.rpas.filter((r) => r.date.startsWith(month));
  return {
    gross: rows.reduce((sum, r) => sum + r.gross, 0),
    inss: rows.reduce((sum, r) => sum + r.inss, 0),
    irrf: rows.reduce((sum, r) => sum + r.irrf, 0)
  };
}

/** What a PF withdrawal of the whole available balance would withhold right now. */
export function previewPfTaxes(gross: number): RpaTaxes {
  return rpaTaxes(gross, monthToDate());
}

/**
 * O saque é sempre do saldo disponível inteiro. PJ manda a nota fiscal junto. Ainda sem tabela de saques
 * no schema: confere tudo e avisa que o saque pelo painel abre em breve, sem fingir que sacou.
 */
export async function requestWithdrawal({ invoice, personType }: { invoice: File | null; personType: PersonType }): Promise<WithdrawalResult> {
  const { available } = await fetchBalance();
  if (available < MIN_WITHDRAWAL) throw new Error(`Saque a partir de ${brl(MIN_WITHDRAWAL)}.`);
  if (personType === 'PJ' && !invoice) throw new Error('Anexe a nota fiscal.');
  if (invoice) {
    const error = validateInvoice(invoice);
    if (error) throw new Error(error);
  }
  throw new Error('O saque pelo painel abre em breve. Seu saldo fica guardado e não expira.');
}

export async function resubmitInvoice({ invoice }: { invoice: File }): Promise<void> {
  const error = validateInvoice(invoice);
  if (error) throw new Error(error);
  const rejected = demo.rejectedInvoice;
  if (!rejected) return;
  demo.rejectedInvoice = { ...rejected, resubmitted: true };
  return wait(undefined);
}

export function monthName(month: number) {
  return MONTHS_LONG[month - 1];
}
