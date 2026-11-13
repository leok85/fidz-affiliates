import type { LedgerEntry, Referral, Tone } from '../types';
import { COMMISSIONED_INSTALLMENTS } from './rules';
import { shortDate } from '../utils/format';

export function ledgerBadge(entry: LedgerEntry): { label: string; tone: Tone } {
  switch (entry.status) {
    case 'grace':
      return { label: entry.releasesAt ? `Libera ${shortDate(entry.releasesAt)}` : 'Em carência', tone: 'warning' };
    case 'available':
      return { label: 'Disponível', tone: 'purple' };
    case 'canceled':
      return { label: 'Cancelada', tone: 'neutral' };
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
    pending: { label: 'Aguardando pagamento', tone: 'warning' as Tone },
    active: { label: 'Ativa', tone: 'success' as Tone },
    trial: { label: 'Em teste grátis', tone: 'warning' as Tone },
    late: { label: 'Atrasada', tone: 'warning' as Tone },
    completed: { label: 'Comissão concluída', tone: 'purple' as Tone },
    canceled: { label: 'Cancelou', tone: 'neutral' as Tone }
  }[status];
}

export function referralCommission(r: Referral) {
  if (r.status === 'trial' || r.status === 'pending') return 'A 1ª mensalidade inteira é sua quando ela pagar';
  const paid = `${r.paidInstallments} de ${COMMISSIONED_INSTALLMENTS} mensalidades`;
  if (r.status === 'canceled') return `Cancelou após ${paid}`;
  return r.plan === 'yearly' ? `${paid} · anual` : `${paid} · 1ª inteira, depois 10%`;
}

/** Progress through the 24 commissioned installments, once the store has paid. */
export function referralProgress(r: Referral): number | null {
  if (r.status === 'trial' || r.status === 'pending') return null;
  return Math.round((r.paidInstallments / COMMISSIONED_INSTALLMENTS) * 100);
}
