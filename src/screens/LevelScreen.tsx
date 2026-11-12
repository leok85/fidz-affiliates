import { Badge } from '../components/core/Badge';
import { useReferrals } from '../data/queries';
import { activeStores, percent, tierProgress } from '../data/tiers';
import { COMMISSION_TIERS, COMMISSIONED_INSTALLMENTS } from '../data/rules';
import { int } from '../utils/format';
import { cx } from '../utils/cx';
import shared from '../styles/shared.module.css';
import styles from './LevelScreen.module.css';

const storesLabel = (n: number) => (n === 1 ? '1 loja' : `${int(n)} lojas`);

export function LevelScreen() {
  const { data: referrals } = useReferrals();
  if (!referrals) return <div className={shared.loading}>Carregando…</div>;
  const stores = activeStores(referrals);
  const tier = tierProgress(stores);

  return (
    <>
      <div className={shared.pageHeader}>
        <div>
          <h1 className={shared.pageHeader__title}>Seu nível</h1>
          <div className={shared.pageHeader__subtitle}>
            Quanto mais lojas indicadas pagando, maior a sua comissão. Cada pagamento usa o nível do dia em que entrou,
            por até {COMMISSIONED_INSTALLMENTS} mensalidades de cada loja.
          </div>
        </div>
      </div>

      <div className={styles.hero}>
        <div className={styles.hero__points}>
          <div className={styles.hero__label}>Nível {tier.current.name}</div>
          <div className={styles.hero__value}>{percent(tier.current.rate)}</div>
          <div className={styles.hero__label}>
            {storesLabel(stores)} pagando agora
          </div>
        </div>
        {tier.next ? (
          <div className={styles.hero__progress}>
            <div className={styles.hero__legend}>
              <span className={styles.hero__next}>
                Próximo nível: {tier.next.name} · {percent(tier.next.rate)}
              </span>
              <span className={styles.hero__label}>
                {int(stores)} de {int(tier.next.minStores)} lojas
              </span>
            </div>
            <div className={styles.hero__track}>
              <div className={styles.hero__fill} style={{ width: `${tier.pct}%` }} />
            </div>
            <div className={styles.hero__label}>Falta{tier.missing === 1 ? '' : 'm'} {storesLabel(tier.missing)} pagando</div>
          </div>
        ) : (
          <div className={styles.hero__next}>Você está no nível mais alto</div>
        )}
      </div>

      <div className={styles.tiers}>
        {COMMISSION_TIERS.map((t) => {
          const isCurrent = t === tier.current;
          const reached = stores >= t.minStores;
          const isNext = t === tier.next;
          return (
            <div
              key={t.level}
              className={cx(styles.tier, isCurrent && styles.tier_reached, isNext && styles.tier_next, !reached && !isNext && styles.tier_locked)}
            >
              <div className={styles.tier__header}>
                <span className={styles.tier__name}>
                  {t.level} · {t.name}
                </span>
                <Badge tone={isCurrent ? 'purple' : isNext ? 'warning' : 'neutral'}>{isCurrent ? 'Seu nível' : isNext ? 'Próximo' : reached ? 'Alcançado' : 'Bloqueado'}</Badge>
              </div>
              <div>
                <div className={styles.tier__points}>{percent(t.rate)}</div>
                <div className={styles.tier__unit}>de comissão</div>
              </div>
              <div className={styles.tier__prize}>
                <div className={styles.tier__prizeLabel}>A partir de</div>
                <div className={styles.tier__prizeValue}>{storesLabel(t.minStores)} pagando</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
