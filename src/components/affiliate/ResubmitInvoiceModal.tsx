import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RejectedInvoice } from '../../types';
import { resubmitInvoice } from '../../data/api';
import { PAYER } from '../../data/rules';
import { brl } from '../../utils/format';
import { Button } from '../core/Button';
import { InvoicePicker } from '../core/InvoicePicker';
import { Modal } from '../core/Modal';
import shared from '../../styles/shared.module.css';
import styles from './ResubmitInvoiceModal.module.css';

export function ResubmitInvoiceModal({ rejected, onClose }: { rejected: RejectedInvoice; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [invoice, setInvoice] = useState<File | null>(null);

  const resubmit = useMutation({
    mutationFn: (file: File) => resubmitInvoice({ invoice: file }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rejected-invoice'] });
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
      onClose();
    }
  });

  return (
    <Modal onClose={onClose}>
      <div className={shared.modal__title}>Enviar nova nota</div>
      <div className={styles.reason}>Motivo da recusa: {rejected.reason}</div>
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
          <span className={shared.details__value}>{brl(rejected.amount)}</span>
        </div>
      </div>
      <InvoicePicker file={invoice} onChange={setInvoice} />
      {resubmit.error && <div className={shared.modal__error}>{resubmit.error.message}</div>}
      <div className={shared.modal__actions}>
        <Button variant="neutral" full onClick={onClose}>
          Cancelar
        </Button>
        <Button full disabled={!invoice || resubmit.isPending} onClick={() => invoice && resubmit.mutate(invoice)}>
          {resubmit.isPending ? 'Enviando…' : 'Enviar nota'}
        </Button>
      </div>
    </Modal>
  );
}
