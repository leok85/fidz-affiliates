import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/core/Badge';
import { ReferralLinkBanner } from '../components/affiliate/ReferralLinkBanner';
import { useBalance, useLedger, usePoints, useProfile, useReferrals } from '../data/queries';
import { goalProgress } from '../data/goals';
import { ledgerBadge } from '../data/status';
import { brl, firstName, int, monthYear } from '../utils/format';
import { cx } from '../utils/cx';
import shared from '../styles/shared.module.css';
import styles from './HomeScreen.module.css';

export function HomeScreen() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: balance } = useBalance();
  const { data: ledger } = useLedger();
  const { data: referrals } = useReferrals();
  const points = usePoints();

  if (!profile || !balance || !ledger || !referrals || points === undefined) return <div className={shared.loading}>Carregando…</div>;

  const active = referrals.filter((r) => r.status === 'active').length;
  const trial = referrals.filter((r) => r.status === 'trial').length;
  const latest = ledger.filter((l) => l.kind === 'commission').slice(0, 4);
  const goal = goalProgress(points);

  return (
    <>
      <h1 className={shared.pageHeader__title}>Olá, {firstName(profile.name)}</h1>

      <ReferralLinkBanner profile={profile} />

      <div className={shared.metricGrid}>
        <div className={shared.metric}>
          <div className={shared.metric__label}>Disponível para saque</div>
          <div className={cx(shared.metric__value, shared.metric__value_purple)}>{brl(balance.available)}</div>
          <div className={shared.metric__note}>Sacar em Ganhos</div>
        </div>
        <div className={shared.metric}>
          <div className={shared.metric__label}>Em carência</div>
          <div className={shared.metric__value}>{brl(balance.grace)}</div>
          <div className={shared.metric__note}>30 dias após cada pagamento</div>
        </div>
        <div className={shared.metric}>
          <div className={shared.metric__label}>Lojas ativas</div>
          <div className={shared.metric__value}>{active}</div>
          <div className={shared.metric__note}>{trial > 0 ? `${trial} em teste grátis` : 'Nenhuma em teste grátis'}</div>
        </div>
        <div className={shared.metric}>
          <div className={shared.metric__label}>Ganho total</div>
          <div className={shared.metric__value}>{brl(balance.available + balance.grace + balance.withdrawn)}</div>
          <div className={shared.metric__note}>Desde {monthYear(profile.since)}</div>
        </div>
      </div>

      <div className={styles.home__bottom}>
        <div className={shared.card}>
          <div className={shared.card__header}>
            <div className={shared.card__title}>Últimas comissões</div>
            <button type="button" className={shared.link} onClick={() => navigate('/ganhos')}>
              Ver todas
            </button>
          </div>
          <div className={styles.home__list}>
            {latest.length === 0 && <div className={styles.home__empty}>As comissões aparecem aqui depois do 1º pagamento de uma loja indicada.</div>}
            {latest.map((l) => {
              const badge = ledgerBadge(l);
              return (
                <div key={l.id} className={styles.home__row}>
                  <div className={styles.home__rowText}>
                    <div className={styles.home__store}>{l.store}</div>
                    <div className={styles.home__desc}>{l.description}</div>
                  </div>
                  <Badge tone={badge.tone}>{badge.label}</Badge>
                  <div className={styles.home__amount}>{brl(l.amount)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.goal}>
          <div className={styles.goal__header}>
            <span className={styles.goal__eyebrow}>Metas</span>
            <button type="button" className={styles.goal__link} onClick={() => navigate('/metas')}>
              Ver metas →
            </button>
          </div>
          <div className={styles.goal__points}>
            <span className={styles.goal__value}>{int(points)}</span>
            <span className={styles.goal__unit}>pontos</span>
          </div>
          {goal.next ? (
            <>
              <div className={styles.goal__progress}>
                <div className={styles.goal__track}>
                  <div className={styles.goal__fill} style={{ width: `${goal.pct}%` }} />
                </div>
                <div className={styles.goal__legend}>
                  <span>Faltam {int(goal.missing)}</span>
                  <span>{int(goal.next.points)}</span>
                </div>
              </div>
              <div className={styles.goal__next}>
                <div>
                  <div className={styles.goal__nextLabel}>Próxima faixa · {goal.next.name}</div>
                  <div className={styles.goal__nextPrize}>{goal.next.prize ?? 'A anunciar'}</div>
                </div>
                <span className={styles.goal__pct}>{goal.pct}%</span>
              </div>
            </>
          ) : (
            <div className={styles.goal__next}>
              <div className={styles.goal__nextPrize}>Todas as faixas conquistadas</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
