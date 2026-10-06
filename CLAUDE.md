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

- O schema do programa de afiliados **ainda não existe** no Supabase. Todas as leituras e gravações
  passam por `src/data/api.ts`, que hoje usa o estado de exemplo de `src/data/demo.ts` (os mesmos
  dados do projeto de design). Quando o schema existir, cada função vira query/RPC com o mesmo
  retorno e as telas não mudam.
- `VITE_DEMO_PERSON_TYPE=PJ` mostra o fluxo de CNPJ (nota fiscal no saque);
  `VITE_DEMO_INVOICE_REJECTED=true` mostra a nota recusada.
- Login: código de 6 dígitos por e-mail (Supabase OTP, `shouldCreateUser: false`). O template de
  e-mail "Magic Link" do Supabase precisa mostrar `{{ .Token }}`.
- Regras do programa (comissão, carência, saque mínimo, INSS, metas) ficam em `src/data/rules.ts`.

## Convenções

- Texto de interface em pt-BR; código e commits em inglês.
- React Query para todo dado do servidor; mutation invalida as queries afetadas.
- CSS modules com classes BEM; **nunca** seletores combinados/descendentes (`.a .b`, `.a > .b`).
- Telas seguem o design "Fidz - Programa de Afiliados" do projeto de design da Fidz (DesignSync,
  projeto `c7a1e727-3d08-4131-9692-266662abd633`); o layout funciona no celular
  (`@media (max-width: 900px)` e `(max-width: 600px)`).
- Vocabulário: "fidelidade", nunca "programa" para o que o lojista cadastra.
