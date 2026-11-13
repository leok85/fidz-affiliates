/*
 * Retenções do RPA do afiliado pessoa física, feitas pela Fidz no saque (o afiliado arca, a Fidz
 * desconta e recolhe). Tudo é mensal: dois saques no mesmo mês somam para o teto do INSS e para
 * a base do IRRF. ISS fica de fora até o contador definir a regra por município. A Fidz é do
 * Simples (Anexo III/V), então não há INSS patronal à parte; ele nunca sairia do afiliado.
 */

/** INSS do contribuinte individual: 11% até o teto de 2026 (R$ 8.475,55 → R$ 932,31). */
export const INSS_RATE = 0.11;
export const INSS_MONTHLY_CAP = 932.31;

/** Tabela progressiva mensal do IRRF (vigente desde mai/2025). */
const IRRF_BRACKETS: { upTo: number; rate: number; deduction: number }[] = [
  { upTo: 2428.8, rate: 0, deduction: 0 },
  { upTo: 2826.65, rate: 0.075, deduction: 182.16 },
  { upTo: 3751.05, rate: 0.15, deduction: 394.16 },
  { upTo: 4664.68, rate: 0.225, deduction: 675.49 },
  { upTo: Infinity, rate: 0.275, deduction: 908.73 }
];

/** Desconto simplificado mensal: substitui as deduções legais quando é maior que elas. */
const SIMPLIFIED_DISCOUNT = 607.2;

/** Lei 15.270/2025: redutor do IRRF mensal, por faixa de rendimento tributável. */
const REDUCTION_FULL_UP_TO = 5000;
const REDUCTION_PARTIAL_UP_TO = 7350;
const REDUCTION_MAX = 312.89;

const round2 = (v: number) => Math.round(v * 100) / 100;

function irrfOn(monthlyIncome: number, inss: number) {
  const base = Math.max(0, monthlyIncome - Math.max(inss, SIMPLIFIED_DISCOUNT));
  const bracket = IRRF_BRACKETS.find((b) => base <= b.upTo)!;
  const tax = Math.max(0, base * bracket.rate - bracket.deduction);
  let reduction = 0;
  if (monthlyIncome <= REDUCTION_FULL_UP_TO) reduction = Math.min(tax, REDUCTION_MAX);
  else if (monthlyIncome <= REDUCTION_PARTIAL_UP_TO) reduction = Math.max(0, 978.62 - 0.133145 * monthlyIncome);
  return Math.max(0, tax - reduction);
}

export interface RpaTaxes {
  inss: number;
  irrf: number;
  net: number;
}

/** Already paid out to this affiliate in the same month (gross and what was withheld). */
export interface MonthToDate {
  gross: number;
  inss: number;
  irrf: number;
}

export function rpaTaxes(gross: number, monthToDate: MonthToDate = { gross: 0, inss: 0, irrf: 0 }): RpaTaxes {
  const monthGross = monthToDate.gross + gross;
  const monthInss = Math.min(monthGross * INSS_RATE, INSS_MONTHLY_CAP);
  const inss = round2(Math.max(0, monthInss - monthToDate.inss));
  const irrf = round2(Math.max(0, irrfOn(monthGross, monthInss) - monthToDate.irrf));
  return { inss, irrf, net: round2(gross - inss - irrf) };
}
