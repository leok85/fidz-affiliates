import type { AffiliateProfile, IncomeReportMonth, LedgerEntry, PersonType, Referral, RejectedInvoice } from '../types';

/*
 * Dados de exemplo do painel, os mesmos do projeto de design ("Fidz - Programa de Afiliados").
 * O schema do programa de afiliados ainda não existe no Supabase (quem cria é o fidz-client-admin):
 * enquanto isso, src/data/api.ts lê e grava neste estado em memória. Para ver o fluxo de CNPJ,
 * use VITE_DEMO_PERSON_TYPE=PJ; para a nota recusada, VITE_DEMO_INVOICE_REJECTED=true.
 */

const personType: PersonType = import.meta.env.VITE_DEMO_PERSON_TYPE === 'PJ' ? 'PJ' : 'PF';
const year = new Date().getFullYear();
const d = (md: string, y = year) => `${y}-${md}`;

export const demo = {
  profile: {
    name: 'Marina Costa',
    email: 'marina@gmail.com',
    code: 'MARINA20',
    link: 'fidz.com.br/r/marina20',
    personType,
    since: d('03-02'),
    documentMasked: personType === 'PJ' ? 'CNPJ 12.···.···/0001-··' : 'CPF ···.482.019-··',
    pixKeyMasked: personType === 'PJ' ? 'CNPJ 12.···.···/0001-··' : 'CPF ···.482.019-··'
  } satisfies AffiliateProfile,

  ledger: [
    { id: 'l1', date: d('09-19'), kind: 'commission', store: 'Padaria Aurora', description: 'Mensalidade 5 de 12', status: 'grace', releasesAt: d('10-19'), amount: 19.8 },
    { id: 'l2', date: d('09-15'), kind: 'commission', store: 'Pet Shop Amigo', description: 'Mensalidade 12 de 12', status: 'grace', releasesAt: d('10-15'), amount: 19.8 },
    { id: 'l3', date: d('08-19'), kind: 'commission', store: 'Padaria Aurora', description: 'Mensalidade 4 de 12', status: 'available', releasesAt: null, amount: 19.8 },
    { id: 'w2', date: d('08-12'), kind: 'withdrawal', store: null, description: `Pix para ${personType === 'PJ' ? 'CNPJ 12.···.···/0001-··' : 'CPF ···.482.019-··'}`, status: 'paid', releasesAt: null, amount: -198 },
    { id: 'l4', date: d('08-08'), kind: 'commission', store: 'Barbearia Dom Zé', description: 'Anuidade', status: 'available', releasesAt: null, amount: 198 },
    { id: 'l5', date: d('08-05'), kind: 'commission', store: 'Açaí da Ilha', description: 'Mensalidade 2 de 12', status: 'available', releasesAt: null, amount: 19.8 },
    { id: 'w1', date: d('06-20'), kind: 'withdrawal', store: null, description: `Pix para ${personType === 'PJ' ? 'CNPJ 12.···.···/0001-··' : 'CPF ···.482.019-··'}`, status: 'paid', releasesAt: null, amount: -214.5 },
    { id: 'l6', date: d('06-15'), kind: 'commission', store: 'Pet Shop Amigo', description: 'Mensalidade 11 de 12', status: 'withdrawn', releasesAt: null, amount: 19.8 }
  ] as LedgerEntry[],

  balance: { available: 237.6, grace: 39.6, withdrawn: 412.5 },

  referrals: [
    { id: 'r1', store: 'Padaria Aurora', signedUpAt: d('04-14'), via: 'link', plan: 'monthly', status: 'active', paidInstallments: 5, earned: 99 },
    { id: 'r2', store: 'Barbearia Dom Zé', signedUpAt: d('07-09'), via: 'code', plan: 'yearly', status: 'active', paidInstallments: 0, earned: 198 },
    { id: 'r3', store: 'Açaí da Ilha', signedUpAt: d('06-06'), via: 'link', plan: 'monthly', status: 'active', paidInstallments: 2, earned: 39.6 },
    { id: 'r4', store: 'Pet Shop Amigo', signedUpAt: d('10-10', year - 1), via: 'code', plan: 'monthly', status: 'completed', paidInstallments: 12, earned: 237.6 },
    { id: 'r5', store: 'Café Lagoa', signedUpAt: d('09-17'), via: 'link', plan: 'monthly', status: 'trial', paidInstallments: 0, earned: 0 },
    { id: 'r6', store: 'Studio Bela', signedUpAt: d('05-03'), via: 'link', plan: 'monthly', status: 'canceled', paidInstallments: 3, earned: 59.4 }
  ] as Referral[],

  rejectedInvoice: (personType === 'PJ' && import.meta.env.VITE_DEMO_INVOICE_REJECTED === 'true'
    ? { withdrawalId: 'w3', amount: 186.3, reason: 'Valor diferente do saque', resubmitted: false }
    : null) as RejectedInvoice | null,

  /** Saques pagos por mês do ano corrente (só PF tem informe). */
  incomeMonths: [
    { month: 6, gross: 214.5, withheld: 214.5 * 0.11 },
    { month: 8, gross: 198, withheld: 198 * 0.11 }
  ] as IncomeReportMonth[]
};

if (demo.rejectedInvoice) {
  demo.ledger.unshift({
    id: 'w3', date: d('09-21'), kind: 'withdrawal', store: null, description: 'Pix para CNPJ 12.···.···/0001-··',
    status: 'invoice_rejected', releasesAt: null, amount: -186.3
  });
}
