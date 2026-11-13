import type { RejectedInvoice } from '../types';
import { rpaTaxes } from './taxes';

/*
 * O que ainda é exemplo no painel: a nota recusada de um saque (só PJ, com
 * VITE_DEMO_INVOICE_REJECTED=true) e os RPAs do informe de rendimentos do PF. Cadastro, indicações,
 * comissões e saldo já vêm do Supabase; isto sai quando o saque existir.
 */

const year = new Date().getFullYear();
const d = (md: string, y = year) => `${y}-${md}`;

interface DemoRpa {
  date: string;
  gross: number;
  inss: number;
  irrf: number;
  paid: boolean;
}

export const demo = {
  rejectedInvoice: (import.meta.env.VITE_DEMO_INVOICE_REJECTED === 'true'
    ? { withdrawalId: 'w3', amount: 186.3, reason: 'Valor diferente do saque', resubmitted: false }
    : null) as RejectedInvoice | null,

  /** RPAs dos saques de PF (os pagos entram no informe; todos contam para o mês). */
  rpas: [
    { date: d('06-20'), gross: 214.5, ...rpaTaxes(214.5), paid: true },
    { date: d('08-12'), gross: 198, ...rpaTaxes(198), paid: true }
  ] as DemoRpa[]
};
