const brlFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const intFormatter = new Intl.NumberFormat('pt-BR');
const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const MONTHS_LONG = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export function brl(value: number) {
  // Intl puts a non-breaking space after "R$"; the design uses a plain one.
  return brlFormatter.format(value).replace(/ /g, ' ');
}

export function int(value: number) {
  return intFormatter.format(value);
}

function parts(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return { y, m, d };
}

/** "19/09", or "10/10/25" when the year isn't the current one. */
export function shortDate(iso: string) {
  const { y, m, d } = parts(iso);
  const dm = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
  return y === new Date().getFullYear() ? dm : `${dm}/${String(y).slice(2)}`;
}

export function fullDate(iso: string) {
  const { y, m, d } = parts(iso);
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

/** "mar/2026" */
export function monthYear(iso: string) {
  const { y, m } = parts(iso);
  return `${MONTHS_SHORT[m - 1]}/${y}`;
}

export function initialsFor(name: string) {
  const words = name.trim().split(/\s+/);
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase();
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? '';
}

export function maskEmail(email: string) {
  const [user, domain] = email.split('@');
  return domain ? `${user.slice(0, 2)}•••@${domain}` : email;
}

export function fileSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
}
