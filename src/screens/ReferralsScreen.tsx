import { Badge } from '../components/core/Badge';
import { useReferrals } from '../data/queries';
import { referralBadge, referralCommission, referralProgress } from '../data/status';
import { brl, shortDate } from '../utils/format';
import { cx } from '../utils/cx';
import shared from '../styles/shared.module.css';
import styles from './ReferralsScreen.module.css';

const PLAN_LABEL = { monthly: 'Mensal', yearly: 'Anual' };
const VIA_LABEL = { link: 'link', code: 'código' };

export function ReferralsScreen() {
  const { data: referrals } = useReferrals();

  return (
    <>
      <div className={shared.pageHeader}>
        <div>
          <h1 className={shared.pageHeader__title}>Indicações</h1>
          <div className={shared.pageHeader__subtitle}>Lojas que se cadastraram pelo seu link ou código.</div>
        </div>
      </div>

      <div className={shared.table}>
        <div className={cx(shared.table__head, styles.referrals__grid)}>
          <div>Loja</div>
          <div>Plano</div>
          <div>Situação</div>
          <div>Comissão</div>
          <div className={shared.table__right}>Você já ganhou</div>
        </div>
        {!referrals && <div className={shared.table__empty}>Carregando…</div>}
        {referrals?.length === 0 && <div className={shared.table__empty}>Nenhuma loja se cadastrou pelo seu link ou código ainda.</div>}
        {referrals?.map((r) => {
          const badge = referralBadge(r.status);
          const progress = referralProgress(r);
          return (
            <div key={r.id} className={cx(shared.table__row, styles.referrals__grid)}>
              <div className={styles.referrals__store}>
                <div className={shared.table__strong}>{r.store}</div>
                <div className={shared.table__sub}>
                  Cadastro em {shortDate(r.signedUpAt)} · via {VIA_LABEL[r.via]}
                </div>
              </div>
              <div className={styles.referrals__plan}>{PLAN_LABEL[r.plan]}</div>
              <div>
                <Badge tone={badge.tone}>{badge.label}</Badge>
              </div>
              <div className={styles.referrals__commission}>
                <div className={styles.referrals__commissionText}>{referralCommission(r)}</div>
                {progress !== null && (
                  <div className={styles.referrals__track}>
                    <div className={styles.referrals__fill} style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
              <div className={cx(shared.table__right, styles.referrals__earned)}>{r.earned ? brl(r.earned) : '—'}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
