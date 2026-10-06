import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AffiliateProfile } from '../../types';
import { requestWithdrawal } from '../../data/api';
import { PAYER, PF_INSS_RATE } from '../../data/rules';
import { brl } from '../../utils/format';
import { Button } from '../core/Button';
import { InvoicePicker } from '../core/InvoicePicker';
import { Modal } from '../core/Modal';
import shared from '../../styles/shared.module.css';
import styles from './WithdrawModal.module.css';

export function WithdrawModal({ profile, available, onClose }: { profile: AffiliateProfile; available: number; onClose: () => void }) {
  const queryClient = useQueryClient();
  const pj = profile.personType === 'PJ';
  const [invoice, setInvoice] = useState<File | null>(null);

  const withdraw = useMutation({
    mutationFn: () => requestWithdrawal({ invoice }),
    onSuccess: () => {
      for (const key of ['balance', 'ledger', 'income-report']) queryClient.invalidateQueries({ queryKey: [key] });
    }
  });

  if (withdraw.data) {
    const { gross, net } = withdraw.data;
    return (
      <Modal onClose={onClose}>
        <div className={styles.done__icon}>✓</div>
        <div className={shared.modal__title}>Saque solicitado</div>
        <div className={styles.done__text}>
          {pj
            ? `Recebemos a nota de ${brl(gross)}. Depois da aprovação, o Pix cai em até 2 dias úteis. Você recebe um aviso no e-mail.`
            : `${brl(net)} (líquido) vai cair na sua chave Pix em até 2 dias úteis. Você recebe um aviso no e-mail quando for pago.`}
        </div>
        <Button onClick={onClose}>Ok</Button>
      </Modal>
    );
  }

  const tax = available * PF_INSS_RATE;
  const canConfirm = (!pj || invoice !== null) && !withdraw.isPending;

  return (
    <Modal onClose={onClose}>
      <div className={shared.modal__title}>Sacar no Pix</div>
      <div className={styles.summary}>
        <div className={styles.summary__row}>
          <span className={shared.details__label}>{pj ? 'Valor' : 'Valor bruto'}</span>
          <span className={styles.summary__amount}>{brl(available)}</span>
        </div>
        {!pj && (
          <>
            <div className={styles.summary__row}>
              <span className={shared.details__label}>INSS (11%) · RPA</span>
              <span className={styles.summary__value}>− {brl(tax)}</span>
            </div>
            <div className={styles.summary__row}>
              <span className={shared.details__label}>Você recebe</span>
              <span className={styles.summary__net}>{brl(available - tax)}</span>
            </div>
          </>
        )}
        <div className={styles.summary__row}>
          <span className={shared.details__label}>Chave Pix</span>
          <span className={styles.summary__value}>{profile.pixKeyMasked}</span>
        </div>
        <div className={styles.summary__row}>
          <span className={shared.details__label}>Prazo</span>
          <span className={styles.summary__value}>{pj ? 'até 2 dias úteis após aprovar a nota' : 'até 2 dias úteis'}</span>
        </div>
      </div>

      {pj && (
        <div className={styles.invoice}>
          <div className={styles.invoice__title}>Nota fiscal de serviço</div>
          <div className={shared.details}>
            <div className={shared.details__row}>
              <span className={shared.details__label}>Tomador</span>
              <span className={shared.details__value}>{PAYER.name}</span>
            </div>
            <div className={shared.details__row}>
              <span className={shared.details__label}>CNPJ</span>
              <span className={shared.details__value}>{PAYER.cnpj}</span>
            </div>
            <div className={shared.details__row}>
              <span className={shared.details__label}>Valor da nota</span>
              <span className={shared.details__value}>{brl(available)}</span>
            </div>
          </div>
          <InvoicePicker file={invoice} onChange={setInvoice} />
        </div>
      )}

      <div className={shared.modal__note}>O saque é sempre do saldo disponível inteiro. Comissões em carência entram no próximo.</div>
      {withdraw.error && <div className={shared.modal__error}>{withdraw.error.message}</div>}
      <div className={shared.modal__actions}>
        <Button variant="neutral" full onClick={onClose}>
          Cancelar
        </Button>
        <Button full disabled={!canConfirm} onClick={() => withdraw.mutate()}>
          {withdraw.isPending ? 'Enviando…' : pj ? 'Enviar nota e sacar' : 'Confirmar saque'}
        </Button>
      </div>
    </Modal>
  );
}
