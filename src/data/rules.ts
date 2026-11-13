/** Regras do programa, iguais às do design e dos Termos do afiliado. */
export const PAYER = { name: 'Kofe Dev Ltda.', cnpj: '47.596.402/0001-64' };
/** Saque mínimo (decisão de 2026-11-12): com uma loja no Essencial, chega no 3º mês. O saldo não expira. */
export const MIN_WITHDRAWAL = 100;
export const GRACE_DAYS = 30;
/**
 * Comissão (decisão de 2026-11-12): o 1º pagamento da loja indicada vai inteiro para o afiliado, e depois
 * 10% de cada pagamento, até 24 mensalidades. No anual, 1/12 da anuidade inteira + 10% do resto.
 */
export const COMMISSION_RATE = 0.1;
export const COMMISSIONED_INSTALLMENTS = 24;
export const INVOICE_MAX_BYTES = 5 * 1024 * 1024;


