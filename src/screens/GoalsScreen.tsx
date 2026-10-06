import { Badge } from '../components/core/Badge';
import { usePoints } from '../data/queries';
import { goalProgress, prizeLabel } from '../data/goals';
import { GOAL_TIERS } from '../data/rules';
import { int } from '../utils/format';
import { cx } from '../utils/cx';
import shared from '../styles/shared.module.css';
import styles from './GoalsScreen.module.css';

export function GoalsScreen() {
  const points = usePoints();
  if (points === undefined) return <div className={shared.loading}>Carregando…</div>;
  const goal = goalProgress(points);

  return (
    <>
      <div className={shared.pageHeader}>
        <div>
          <h1 className={shared.pageHeader__title}>Metas</h1>
          <div className={shared.pageHeader__subtitle}>
            Cada R$ 1,00 pago pelas lojas que você indicou vale 4 pontos. Os pontos entram 30 dias depois de cada pagamento.
          </div>
        </div>
      </div>

      <div className={styles.hero}>
        <div className={styles.hero__points}>
          <div className={styles.hero__label}>Seus pontos</div>
          <div className={styles.hero__value}>{int(points)}</div>
          <div className={styles.hero__label}>{goal.current ? `Faixa atual: ${goal.current.name}` : 'Nenhuma faixa ainda'}</div>
        </div>
        {goal.next ? (
          <div className={styles.hero__progress}>
            <div className={styles.hero__legend}>
              <span className={styles.hero__next}>
                Próxima faixa: {goal.next.name} · {prizeLabel(goal.next.prize)}
              </span>
              <span className={styles.hero__label}>
                {int(points)} de {int(goal.next.points)} pontos
              </span>
            </div>
            <div className={styles.hero__track}>
              <div className={styles.hero__fill} style={{ width: `${goal.pct}%` }} />
            </div>
            <div className={styles.hero__label}>Faltam {int(goal.missing)} pontos</div>
          </div>
        ) : (
          <div className={styles.hero__next}>Todas as faixas conquistadas</div>
        )}
      </div>

      <div className={styles.tiers}>
        {GOAL_TIERS.map((tier) => {
          const reached = points >= tier.points;
          const isNext = tier === goal.next;
          return (
            <div key={tier.level} className={cx(styles.tier, reached && styles.tier_reached, isNext && styles.tier_next, !reached && !isNext && styles.tier_locked)}>
              <div className={styles.tier__header}>
                <span className={styles.tier__name}>
                  {tier.level} · {tier.name}
                </span>
                <Badge tone={reached ? 'purple' : isNext ? 'warning' : 'neutral'}>{reached ? 'Conquistado' : isNext ? 'Próximo' : 'Bloqueado'}</Badge>
              </div>
              <div>
                <div className={styles.tier__points}>{int(tier.points)}</div>
                <div className={styles.tier__unit}>pontos</div>
              </div>
              <div className={styles.tier__prize}>
                <div className={styles.tier__prizeLabel}>Prêmio</div>
                <div className={cx(styles.tier__prizeValue, !tier.prize && styles.tier__prizeValue_tbd)}>{prizeLabel(tier.prize)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
