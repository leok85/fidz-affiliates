import { rpaTaxes } from './taxes';

/*
 * O que ainda é exemplo no painel: os RPAs do informe de rendimentos do PF, que só abre quando o
 * afiliado pessoa física existir. Todo o resto vem do Supabase.
 */

const year = new Date().getFullYear();
const d = (md: string, y = year) => `${y}-${md}`;

interface DemoRpa {
  date: string;
  gross: number;
  inss: number;
  irrf: number;
  paid: boolean;
}

export const demo = {

  /** RPAs dos saques de PF (os pagos entram no informe; todos contam para o mês). */
  rpas: [
    { date: d('06-20'), gross: 214.5, ...rpaTaxes(214.5), paid: true },
    { date: d('08-12'), gross: 198, ...rpaTaxes(198), paid: true }
  ] as DemoRpa[]
};
