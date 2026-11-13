import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAffiliateAccess } from '../data/queries';

interface AuthContextValue {
  session: Session | null;
  /** True while the session or the affiliate row is still being checked. */
  loading: boolean;
  /** Signed in and with an active row in public.affiliates. */
  isAffiliate: boolean;
  authError: string | null;
  sendCode: (email: string) => Promise<string | null>;
  verifyCode: (email: string, code: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Turns Supabase auth errors into the copy shown under the login form. */
function authMessage(message: string): string {
  if (/signups not allowed|user not found/i.test(message)) return 'Este e-mail não está cadastrado no programa de afiliados.';
  if (/expired|invalid/i.test(message)) return 'Código inválido ou vencido. Confira os 6 dígitos ou peça um novo.';
  if (/rate limit|security purposes|too many/i.test(message)) return 'Aguarde um minuto antes de pedir outro código.';
  return 'Não foi possível entrar agora. Tente de novo em instantes.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoading(false);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => subscription.subscription.unsubscribe();
  }, []);

  // Uma conta do Auth pode ser só de dono de loja: o painel exige o cadastro de afiliado ativo.
  const access = useAffiliateAccess(Boolean(session));
  const accessStatus = access.data?.status;
  useEffect(() => {
    if (!session) return;
    if (accessStatus === 'missing') setAuthError('Este e-mail não está cadastrado no programa de afiliados.');
    else if (accessStatus === 'disabled') setAuthError('Seu cadastro de afiliado está desativado. Fale com a Fidz pelo suporte.');
    else if (access.isError) setAuthError('Não foi possível carregar seu cadastro. Tente de novo em instantes.');
    else return;
    void signOut();
  }, [session, accessStatus, access.isError]);

  const isAffiliate = Boolean(session) && accessStatus === 'active';
  const loading = sessionLoading || (Boolean(session) && !isAffiliate && !access.isError && accessStatus === undefined);

  // Login sem senha: o afiliado recebe um código de 6 dígitos no e-mail do cadastro. Só entra quem
  // já tem conta (shouldCreateUser: false); o cadastro é pela página de cadastro de afiliados.
  async function sendCode(email: string) {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    return error ? authMessage(error.message) : null;
  }

  async function verifyCode(email: string, code: string) {
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
    return error ? authMessage(error.message) : null;
  }

  async function signOut() {
    await supabase.auth.signOut();
    queryClient.clear();
  }

  return <AuthContext.Provider value={{ session, loading, isAffiliate, authError, sendCode, verifyCode, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
