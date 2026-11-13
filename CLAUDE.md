# fidz-affiliates — Painel do afiliado

Painel do programa de afiliados da Fidz (afiliados.fidz.com.br): React + Vite + TypeScript +
Supabase, com a mesma estrutura do fidz-admin e do fidz-client-admin.

## Fluxo de trabalho (vale para toda sessão)

1. **Nunca commitar direto na `main`.** Toda funcionalidade ou correção vai numa branch
   (`feature/…`, `fix/…`, `chore/…`) e entra na `main` por **pull request**.
2. **O CI precisa estar verde antes do merge** (tipos e build; segredos no código com gitleaks).
3. **Mudança de banco:** quem cria e aplica migration é só o fidz-client-admin. Um PR daqui que
   depende de migration fica em rascunho até ela estar em produção.
4. **Funcionalidade em vários repos:** um PR por repo, mesmo nome de branch quando fizer sentido,
   mergeados na ordem banco (fidz-client-admin) → este repo.

## Dados

- Todas as leituras e gravações passam por `src/data/api.ts`. O cadastro vem de `public.affiliates`
  (o afiliado lê só a própria linha). Indicações, comissões e saldo vêm das RPCs `get_affiliate_referrals`,
  `get_affiliate_commissions` e `get_affiliate_balance` (migrations do fidz-client-admin; a comissão é
  gravada por trigger em `invoices` quando a loja indicada paga). Saque: o afiliado PJ envia a nota ao
  bucket privado `affiliate-invoices` (`<id do afiliado>/…`) e chama `request_affiliate_withdrawal`; nota
  recusada volta por `resubmit_affiliate_invoice`. O Admin aprova e paga no fidz-admin. Só o informe do
  PF ainda usa o estado de exemplo de `src/data/demo.ts`.
- Login: código de 6 dígitos por e-mail (Supabase OTP, `shouldCreateUser: false`; o usuário do Auth
  é criado pela edge function `affiliate-signup` no cadastro em fidz.com.br/afiliados). Só entra
  quem tem linha ativa em `affiliates`. O código vem no template "Magic Link" do Supabase
  (`{{ .Token }}`, fonte em `supabase-email-templates/magic-link.html` no fidz-client-admin), o
  mesmo e-mail dos donos de loja; vale 1 hora.
- Regras do programa ficam em `src/data/rules.ts` (iguais a `affiliate_program_rules()` no banco): 1ª
  mensalidade inteira, depois 10% até 24 mensalidades (anual: 1/12 inteiro + 10% do resto), carência de
  30 dias, saque mínimo de R$ 100. Só PJ por enquanto (PF em breve).
- Retenções do RPA de PF ficam em `src/data/taxes.ts`: INSS 11% com teto mensal e IRRF com o redutor
  da Lei 15.270/2025, somando os saques do mês. ISS fora até o contador definir a regra por
  município. Sem INSS patronal à parte (Fidz no Simples, Anexo III/V).

## Convenções

- Texto de interface em pt-BR; código e commits em inglês.
- React Query para todo dado do servidor; mutation invalida as queries afetadas.
- CSS modules com classes BEM; **nunca** seletores combinados/descendentes (`.a .b`, `.a > .b`).
- Telas seguem o design "Fidz - Programa de Afiliados" do projeto de design da Fidz (DesignSync,
  projeto `c7a1e727-3d08-4131-9692-266662abd633`); o layout funciona no celular
  (`@media (max-width: 900px)` e `(max-width: 600px)`).
- Vocabulário: "fidelidade", nunca "programa" para o que o lojista cadastra.
