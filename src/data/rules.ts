import type { GoalTier } from '../types';

/** Regras do programa, iguais às do design e dos Termos do afiliado. */
export const PAYER = { name: 'Kofe Dev Ltda.', cnpj: '47.596.402/0001-64' };
export const MIN_WITHDRAWAL = 30;
export const COMMISSION_RATE = 0.2;
export const GRACE_DAYS = 30;
export const POINTS_PER_REAL = 4;
export const COMMISSIONED_INSTALLMENTS = 12;
export const INVOICE_MAX_BYTES = 5 * 1024 * 1024;

// Prêmios ainda a definir (decisão de 2026-11-12): null mostra "A anunciar". Os pontos já contam.
export const GOAL_TIERS: GoalTier[] = [
  { level: 1, name: 'Bronze', points: 24000, prize: null },
  { level: 2, name: 'Prata', points: 96000, prize: null },
  { level: 3, name: 'Ouro', points: 240000, prize: null },
  { level: 4, name: 'Diamante', points: 504000, prize: null }
];

/** Pontos: cada R$ 1,00 pago pelas lojas indicadas vale 4 pontos, contados só depois da carência. */
export function pointsFromCommissions(releasedCommissions: number) {
  return Math.round((releasedCommissions / COMMISSION_RATE) * POINTS_PER_REAL);
}
