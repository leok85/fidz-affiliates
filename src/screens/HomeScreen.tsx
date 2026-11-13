import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/core/Badge';
import { ReferralLinkBanner } from '../components/affiliate/ReferralLinkBanner';
import { useBalance, useLedger, useProfile, useReferrals } from '../data/queries';
import { MIN_WITHDRAWAL } from '../data/rules';
import { ledgerBadge } from '../data/status';
import { brl, firstName, monthYear } from '../utils/format';
import { cx } from '../utils/cx';
import shared from '../styles/shared.module.css';
import styles from './HomeScreen.module.css';

export function HomeScreen() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: balance } = useBalance();
  const { data: ledger } = useLedger();
  const { data: referrals } = useReferrals();

  if (!profile || !balance || !ledger || !referrals) return <div className={shared.loading}>Carregando…</div>;

  const active = referrals.filter((r) => r.status === 'active').length;
  const waiting = referrals.filter((r) => r.status === 'trial' || r.status === 'pending').length;
  const latest = ledger.filter((l) => l.kind === 'commission').slice(0, 4);
  const ready = balance.available >= MIN_WITHDRAWAL;
  const pct = Math.min(100, Math.round((balance.available / MIN_WITHDRAWAL) * 100));

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
          <div className={shared.metric__note}>{waiting > 0 ? `${waiting} aguardando o 1º pagamento` : 'Nenhuma aguardando pagamento'}</div>
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
            <span className={styles.goal__eyebrow}>Próximo saque</span>
            <button type="button" className={styles.goal__link} onClick={() => navigate('/ganhos')}>
              Ver ganhos →
            </button>
          </div>
          <div className={styles.goal__points}>
            <span className={styles.goal__value}>{brl(balance.available)}</span>
            <span className={styles.goal__unit}>disponível</span>
          </div>
          <div className={styles.goal__progress}>
            <div className={styles.goal__track}>
              <div className={styles.goal__fill} style={{ width: `${pct}%` }} />
            </div>
            <div className={styles.goal__legend}>
              <span>{ready ? 'Pronto para sacar' : `Faltam ${brl(MIN_WITHDRAWAL - balance.available)}`}</span>
              <span>{brl(MIN_WITHDRAWAL)}</span>
            </div>
          </div>
          <div className={styles.goal__next}>
            <div>
              <div className={styles.goal__nextLabel}>Como você ganha</div>
              <div className={styles.goal__nextPrize}>1ª mensalidade inteira + 10% por 2 anos</div>
            </div>
            <span className={styles.goal__pct}>{pct}%</span>
          </div>
        </div>
      </div>
    </>
  );
}
