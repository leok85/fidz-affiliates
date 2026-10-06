import { useState } from 'react';
import { Badge } from '../components/core/Badge';
import { Button } from '../components/core/Button';
import { AlertIcon } from '../components/icons/Icons';
import { WithdrawModal } from '../components/affiliate/WithdrawModal';
import { ResubmitInvoiceModal } from '../components/affiliate/ResubmitInvoiceModal';
import { useBalance, useLedger, useProfile, useRejectedInvoice } from '../data/queries';
import { ledgerBadge } from '../data/status';
import { MIN_WITHDRAWAL } from '../data/rules';
import { brl, monthYear, shortDate } from '../utils/format';
import { cx } from '../utils/cx';
import shared from '../styles/shared.module.css';
import styles from './EarningsScreen.module.css';

export function EarningsScreen() {
  const { data: profile } = useProfile();
  const { data: balance } = useBalance();
  const { data: ledger } = useLedger();
  const { data: rejected } = useRejectedInvoice();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [resubmitOpen, setResubmitOpen] = useState(false);

  if (!profile || !balance) return <div className={shared.loading}>Carregando…</div>;
  const canWithdraw = balance.available >= MIN_WITHDRAWAL;

  return (
    <>
      <h1 className={shared.pageHeader__title}>Ganhos e saque</h1>

      {rejected && !rejected.resubmitted && (
        <div className={styles.rejected}>
          <div className={styles.rejected__icon}>
            <AlertIcon />
          </div>
          <div className={styles.rejected__text}>
            <div className={styles.rejected__title}>Nota recusada no saque de {brl(rejected.amount)}</div>
            <div className={styles.rejected__reason}>Motivo: {rejected.reason}</div>
          </div>
          <Button variant="danger" className={styles.rejected__action} onClick={() => setResubmitOpen(true)}>
            Enviar nova nota
          </Button>
        </div>
      )}
      {rejected?.resubmitted && (
        <div className={styles.resubmitted}>
          <span className={styles.resubmitted__strong}>Nova nota enviada.</span> Está em análise. Depois da aprovação, o Pix de{' '}
          {brl(rejected.amount)} cai em até 2 dias úteis.
        </div>
      )}

      <div className={styles.earnings__summary}>
        <div className={styles.available}>
          <div>
            <div className={shared.metric__label}>Disponível para saque</div>
            <div className={styles.available__value}>{brl(balance.available)}</div>
            <div className={shared.metric__note}>Saque a partir de {brl(MIN_WITHDRAWAL)}</div>
          </div>
          <Button disabled={!canWithdraw} onClick={() => setWithdrawOpen(true)}>
            Sacar no Pix
          </Button>
        </div>
        <div className={shared.card}>
          <div className={shared.metric__label}>Em carência</div>
          <div className={styles.earnings__value}>{brl(balance.grace)}</div>
          <div className={styles.earnings__note}>Libera 30 dias após o pagamento da loja.</div>
        </div>
        <div className={shared.card}>
          <div className={shared.metric__label}>Já sacado</div>
          <div className={styles.earnings__value}>{brl(balance.withdrawn)}</div>
          <div className={styles.earnings__note}>Desde {monthYear(profile.since)}</div>
        </div>
      </div>

      <div className={shared.table}>
        <div className={cx(shared.table__head, styles.ledger__grid)}>
          <div>Data</div>
          <div>Loja</div>
          <div>Referente a</div>
          <div>Situação</div>
          <div className={shared.table__right}>Valor</div>
        </div>
        {!ledger && <div className={shared.table__empty}>Carregando…</div>}
        {ledger?.length === 0 && <div className={shared.table__empty}>Nenhum lançamento ainda.</div>}
        {ledger?.map((l) => {
          const badge = ledgerBadge(l);
          const isWithdrawal = l.kind === 'withdrawal';
          return (
            <div key={l.id} className={cx(shared.table__row, styles.ledger__grid)}>
              <div className={styles.ledger__date}>{shortDate(l.date)}</div>
              <div className={styles.ledger__store}>{isWithdrawal ? 'Saque' : l.store}</div>
              <div className={styles.ledger__desc}>{l.description}</div>
              <div className={styles.ledger__status}>
                <Badge tone={badge.tone}>{badge.label}</Badge>
              </div>
              <div className={cx(styles.ledger__amount, isWithdrawal && styles.ledger__amount_withdrawal)}>
                {isWithdrawal ? `− ${brl(Math.abs(l.amount))}` : brl(l.amount)}
              </div>
            </div>
          );
        })}
      </div>

      {withdrawOpen && <WithdrawModal profile={profile} available={balance.available} onClose={() => setWithdrawOpen(false)} />}
      {resubmitOpen && rejected && <ResubmitInvoiceModal rejected={rejected} onClose={() => setResubmitOpen(false)} />}
    </>
  );
}
