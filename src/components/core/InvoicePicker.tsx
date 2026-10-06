import { useRef, useState } from 'react';
import { validateInvoice } from '../../data/api';
import { fileSize } from '../../utils/format';
import { cx } from '../../utils/cx';
import { UploadFileIcon } from '../icons/Icons';
import styles from './InvoicePicker.module.css';

/** Campo de anexo da nota fiscal de serviço (PDF ou XML, até 5 MB). */
export function InvoicePicker({ file, onChange }: { file: File | null; onChange: (file: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function pick(next: File | undefined) {
    if (!next) return;
    const problem = validateInvoice(next);
    setError(problem);
    onChange(problem ? null : next);
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !file && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !file && inputRef.current?.click()}
        className={cx(styles.picker, file && styles.picker_filled)}
      >
        <div className={styles.picker__icon}>
          <UploadFileIcon />
        </div>
        <div className={styles.picker__text}>
          <div className={cx(styles.picker__title, file && styles.picker__title_filled)}>{file ? file.name : 'Anexar nota fiscal'}</div>
          <div className={styles.picker__sub}>{file ? fileSize(file.size) : 'PDF ou XML, até 5 MB'}</div>
        </div>
        {file && (
          <button
            type="button"
            className={styles.picker__swap}
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
              inputRef.current?.click();
            }}
          >
            Trocar
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.xml,application/pdf,text/xml,application/xml"
          hidden
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      {error && <div className={styles.picker__error}>{error}</div>}
    </div>
  );
}
