import type { CommissionTier } from '../types';

/** Regras do programa, iguais às do design e dos Termos do afiliado. */
export const PAYER = { name: 'Kofe Dev Ltda.', cnpj: '47.596.402/0001-64' };
export const MIN_WITHDRAWAL = 30;
export const GRACE_DAYS = 30;
export const COMMISSIONED_INSTALLMENTS = 12;
export const INVOICE_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Níveis de comissão (decisão de 2026-11-12, no lugar de pontos e prêmios): a taxa de cada comissão depende
 * de quantas lojas indicadas estão pagando no momento do pagamento. O nível pode cair se lojas cancelarem;
 * comissões já geradas não mudam.
 */
export const COMMISSION_TIERS: CommissionTier[] = [
  { level: 1, name: 'Inicial', minStores: 1, rate: 0.1 },
  { level: 2, name: 'Prata', minStores: 5, rate: 0.15 },
  { level: 3, name: 'Ouro', minStores: 15, rate: 0.2 }
];

