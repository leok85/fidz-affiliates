import type { LedgerEntry, Referral, Tone } from '../types';
import { COMMISSIONED_INSTALLMENTS } from './rules';
import { shortDate } from '../utils/format';

export function ledgerBadge(entry: LedgerEntry): { label: string; tone: Tone } {
  switch (entry.status) {
    case 'grace':
      return { label: entry.releasesAt ? `Libera ${shortDate(entry.releasesAt)}` : 'Em carência', tone: 'warning' };
    case 'available':
      return { label: 'Disponível', tone: 'purple' };
    case 'withdrawn':
      return { label: 'Sacado', tone: 'neutral' };
    case 'paid':
      return { label: 'Saque Pix', tone: 'success' };
    case 'processing':
      return { label: 'Processando', tone: 'warning' };
    case 'invoice_review':
      return { label: 'Nota em análise', tone: 'warning' };
    case 'invoice_rejected':
      return { label: 'Nota recusada', tone: 'danger' };
  }
}

export function referralBadge(status: Referral['status']): { label: string; tone: Tone } {
  return {
    active: { label: 'Ativa', tone: 'success' as Tone },
    trial: { label: 'Em teste grátis', tone: 'warning' as Tone },
    completed: { label: 'Comissão concluída', tone: 'purple' as Tone },
    canceled: { label: 'Cancelou', tone: 'neutral' as Tone }
  }[status];
}

export function referralCommission(r: Referral) {
  if (r.plan === 'yearly') return '20% da anuidade · pago';
  if (r.status === 'trial') return 'Começa no 1º pagamento';
  if (r.status === 'canceled') return `Cancelou após ${r.paidInstallments} de ${COMMISSIONED_INSTALLMENTS} mensalidades`;
  return `20% · ${r.paidInstallments} de ${COMMISSIONED_INSTALLMENTS} mensalidades`;
}

/** Monthly plans past their trial show a 12-installment progress bar. */
export function referralProgress(r: Referral): number | null {
  if (r.plan !== 'monthly' || r.status === 'trial') return null;
  return Math.round((r.paidInstallments / COMMISSIONED_INSTALLMENTS) * 100);
}
