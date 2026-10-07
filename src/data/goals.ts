import { GOAL_TIERS } from './rules';

export function goalProgress(points: number) {
  const next = GOAL_TIERS.find((t) => t.points > points) ?? null;
  const current = [...GOAL_TIERS].reverse().find((t) => t.points <= points) ?? null;
  const pct = next ? Math.round((points / next.points) * 100) : 100;
  return { next, current, pct, missing: next ? next.points - points : 0 };
}

export function prizeLabel(prize: string | null) {
  return prize ?? 'A anunciar';
}
