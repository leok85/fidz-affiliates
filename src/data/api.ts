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
  const row = data as { available: number; grace: number; withdrawn: number; in_withdrawal: number };
  return {
    available: Number(row.available),
    grace: Number(row.grace),
    withdrawn: Number(row.withdrawn),
    inWithdrawal: Number(row.in_withdrawal)
  };
}

interface WithdrawalRow {
  id: number;
  amount: number;
  status: 'invoice_review' | 'invoice_rejected' | 'processing' | 'paid';
  rejection_reason: string | null;
  requested_at: string;
  paid_at: string | null;
}

async function fetchWithdrawals(): Promise<WithdrawalRow[]> {
  const { data, error } = await supabase.rpc('get_affiliate_withdrawals');
  if (error) throw error;
  return (data ?? []) as WithdrawalRow[];
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
  const [{ data, error }, withdrawals] = await Promise.all([supabase.rpc('get_affiliate_commissions'), fetchWithdrawals()]);
  if (error) throw error;
  const commissions: LedgerEntry[] = ((data ?? []) as CommissionRow[]).map((c) => ({
    id: `c${c.id}`,
    date: c.paid_at.slice(0, 10),
    kind: 'commission',
    store: c.store,
    description: commissionDescription(c),
    status: c.state,
    releasesAt: c.state === 'grace' ? c.releases_at.slice(0, 10) : null,
    amount: Number(c.amount)
  }));
  const payouts: LedgerEntry[] = withdrawals.map((w) => ({
    id: `w${w.id}`,
    date: (w.paid_at ?? w.requested_at).slice(0, 10),
    kind: 'withdrawal',
    store: null,
    description: '',
    status: w.status,
    releasesAt: null,
    amount: -Number(w.amount)
  }));
  return [...payouts, ...commissions].sort((a, b) => b.date.localeCompare(a.date));
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

/** O saque aberto com a nota recusada, se houver (só um saque aberto por vez). */
export async function fetchRejectedInvoice(): Promise<RejectedInvoice | null> {
  const rejected = (await fetchWithdrawals()).find((w) => w.status === 'invoice_rejected');
  return rejected
    ? { withdrawalId: String(rejected.id), amount: Number(rejected.amount), reason: rejected.rejection_reason ?? '', resubmitted: false }
    : null;
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

const WITHDRAWAL_ERRORS: Record<string, string> = {
  not_affiliate: 'Seu cadastro de afiliado não está ativo.',
  pf_unavailable: 'O saque de pessoa física ainda não está disponível.',
  withdrawal_open: 'Você já tem um saque em andamento. O próximo fica liberado depois que ele for pago.',
  below_minimum: `Saque a partir de ${brl(MIN_WITHDRAWAL)}.`,
  invoice_missing: 'Não conseguimos receber a nota. Envie o arquivo de novo.',
  withdrawal_not_rejected: 'Esse saque não está com a nota recusada.'
};

function withdrawalError(error: { message: string }) {
  const known = Object.keys(WITHDRAWAL_ERRORS).find((code) => error.message.includes(code));
  return new Error(known ? WITHDRAWAL_ERRORS[known] : 'Não foi possível concluir agora. Tente de novo em alguns minutos.');
}

/** Envia a nota para a pasta do afiliado no bucket privado affiliate-invoices e devolve o caminho. */
async function uploadInvoice(file: File): Promise<string> {
  const error = validateInvoice(file);
  if (error) throw new Error(error);
  const { data: affiliateId, error: idError } = await supabase.rpc('current_affiliate_id');
  if (idError || !affiliateId) throw withdrawalError(idError ?? { message: 'not_affiliate' });
  const ext = file.name.toLowerCase().endsWith('.xml') ? 'xml' : 'pdf';
  const path = `${affiliateId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('affiliate-invoices')
    .upload(path, file, { contentType: ext === 'xml' ? 'application/xml' : 'application/pdf' });
  if (uploadError) throw withdrawalError({ message: 'invoice_missing' });
  return path;
}

/** O saque é sempre do saldo disponível inteiro, com a nota fiscal no valor do saque (só PJ por enquanto). */
export async function requestWithdrawal({ invoice, personType }: { invoice: File | null; personType: PersonType }): Promise<WithdrawalResult> {
  if (personType !== 'PJ') throw withdrawalError({ message: 'pf_unavailable' });
  if (!invoice) throw new Error('Anexe a nota fiscal.');
  const path = await uploadInvoice(invoice);
  const { data, error } = await supabase.rpc('request_affiliate_withdrawal', { p_invoice_path: path });
  if (error) throw withdrawalError(error);
  const gross = Number(data);
  return { gross, net: gross };
}

export async function resubmitInvoice({ withdrawalId, invoice }: { withdrawalId: string; invoice: File }): Promise<void> {
  const path = await uploadInvoice(invoice);
  const { error } = await supabase.rpc('resubmit_affiliate_invoice', { p_withdrawal_id: Number(withdrawalId), p_invoice_path: path });
  if (error) throw withdrawalError(error);
}

export function monthName(month: number) {
  return MONTHS_LONG[month - 1];
}
