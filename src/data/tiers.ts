import { COMMISSION_TIERS } from './rules';

/** O nível de quem tem `activeStores` lojas indicadas pagando agora, e quanto falta para o próximo. */
export function tierProgress(activeStores: number) {
  const current = [...COMMISSION_TIERS].reverse().find((t) => t.minStores <= activeStores) ?? COMMISSION_TIERS[0];
  const next = COMMISSION_TIERS.find((t) => t.minStores > activeStores) ?? null;
  const pct = next ? Math.round((activeStores / next.minStores) * 100) : 100;
  return { current, next, pct, missing: next ? next.minStores - activeStores : 0 };
}

export const percent = (rate: number) => `${Math.round(rate * 100)}%`;

/** Lojas que contam para o nível: as indicadas que estão pagando em dia. */
export const activeStores = (referrals: { status: string }[]) => referrals.filter((r) => r.status === 'active').length;
