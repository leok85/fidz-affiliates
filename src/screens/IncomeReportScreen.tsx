import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/core/Button';
import { fetchIncomeReport, fetchIncomeYears, monthName } from '../data/api';
import { useProfile } from '../data/queries';
import { PAYER } from '../data/rules';
import { brl, fullDate } from '../utils/format';
import { cx } from '../utils/cx';
import shared from '../styles/shared.module.css';
import styles from './IncomeReportScreen.module.css';

export function IncomeReportScreen() {
  const { data: profile } = useProfile();
  const { data: years } = useQuery({ queryKey: ['income-years'], queryFn: fetchIncomeYears });
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    if (years && year === null) setYear(years[years.length - 1]);
  }, [years, year]);
  const { data: report } = useQuery({
    queryKey: ['income-report', year],
    queryFn: () => fetchIncomeReport(year!),
    enabled: year !== null
  });

  if (profile?.personType === 'PJ') return <Navigate to="/" replace />;
  if (!profile || !years || !report) return <div className={shared.loading}>Carregando…</div>;

  const gross = report.months.reduce((sum, m) => sum + m.gross, 0);
  const withheld = report.months.reduce((sum, m) => sum + m.withheld, 0);

  return (
    <>
      <div className={shared.pageHeader}>
        <div>
          <h1 className={shared.pageHeader__title}>Informe de rendimentos</h1>
          <div className={shared.pageHeader__subtitle}>Para a declaração do Imposto de Renda. Somente saques pagos entram no informe.</div>
        </div>
        <div className={styles.years} data-print-hide>
          {years.map((y) => (
            <button key={y} type="button" className={cx(styles.years__item, y === year && styles.years__item_active)} onClick={() => setYear(y)}>
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.report__top}>
        <div className={styles.parties}>
          <div>
            <div className={styles.parties__label}>Fonte pagadora</div>
            <div className={styles.parties__value}>{PAYER.name}</div>
          </div>
          <div>
            <div className={styles.parties__label}>CNPJ</div>
            <div className={styles.parties__value}>{PAYER.cnpj}</div>
          </div>
          <div>
            <div className={styles.parties__label}>Beneficiário</div>
            <div className={styles.parties__value}>{profile.name}</div>
          </div>
          <div>
            <div className={styles.parties__label}>CPF</div>
            <div className={styles.parties__value}>{profile.documentMasked.replace(/^CPF\s*/, '')}</div>
          </div>
          <div>
            <div className={styles.parties__label}>Ano-calendário</div>
            <div className={styles.parties__value}>{report.year}</div>
          </div>
          <div>
            <div className={styles.parties__label}>Natureza</div>
            <div className={styles.parties__value}>Comissão por indicação (RPA)</div>
          </div>
        </div>

        <div className={styles.total}>
          <div className={styles.total__label}>Rendimento bruto em {report.year}</div>
          <div className={styles.total__value}>{brl(gross)}</div>
          <div className={styles.total__withheld}>Impostos retidos: {brl(withheld)}</div>
          <div className={styles.total__label}>
            {report.isFinal ? 'Informe final do ano.' : `Ano em andamento. O informe final sai até ${fullDate(report.finalReportDate)}.`}
          </div>
          <span data-print-hide className={styles.total__action}>
            <Button variant="reward" onClick={() => window.print()}>
              {report.isFinal ? 'Baixar informe (PDF)' : 'Baixar parcial (PDF)'}
            </Button>
          </span>
        </div>
      </div>

      <div className={shared.table}>
        <div className={cx(shared.table__head, styles.months__grid)}>
          <div>Mês</div>
          <div className={shared.table__right}>Bruto</div>
          <div className={cx(shared.table__right, styles.months__withheld)}>Impostos retidos</div>
          <div className={shared.table__right}>Líquido</div>
        </div>
        {report.months.map((m) => (
          <div key={m.month} className={cx(shared.table__row, styles.months__grid, !m.gross && styles.months__row_empty)}>
            <div className={styles.months__name}>{monthName(m.month)}</div>
            <div className={shared.table__right}>{brl(m.gross)}</div>
            <div className={cx(shared.table__right, styles.months__withheld)}>{brl(m.withheld)}</div>
            <div className={cx(shared.table__right, styles.months__net)}>{brl(m.gross - m.withheld)}</div>
          </div>
        ))}
      </div>
    </>
  );
}
