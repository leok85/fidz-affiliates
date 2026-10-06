import { useState, type FormEvent } from 'react';
import logo from '../assets/fidz-logo-tight.png';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/core/Button';
import { maskEmail } from '../utils/format';
import styles from './LoginScreen.module.css';

const SIGNUP_URL = 'https://fidz.com.br/afiliados';
const EMAIL_RE = /.+@.+\..+/;

export function LoginScreen() {
  const { sendCode, verifyCode } = useAuth();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const emailOk = EMAIL_RE.test(email.trim());

  async function submitEmail(e: FormEvent) {
    e.preventDefault();
    if (!emailOk || busy) return;
    setBusy(true);
    const problem = await sendCode(email.trim());
    setBusy(false);
    setError(problem);
    if (!problem) {
      setCode('');
      setResent(false);
      setStep('code');
    }
  }

  async function submitCode(e: FormEvent) {
    e.preventDefault();
    if (code.length !== 6 || busy) return;
    setBusy(true);
    const problem = await verifyCode(email.trim(), code);
    setBusy(false);
    setError(problem);
  }

  async function resend() {
    if (resent || busy) return;
    const problem = await sendCode(email.trim());
    setError(problem);
    if (!problem) setResent(true);
  }

  return (
    <div className={styles.login}>
      <div className={styles.login__card}>
        <div className={styles.login__brand}>
          <img src={logo} alt="Fidz" className={styles.login__logo} />
          <span className={styles.login__tag}>Afiliados</span>
        </div>

        {step === 'email' ? (
          <form className={styles.login__form} onSubmit={submitEmail}>
            <h1 className={styles.login__title}>Entrar</h1>
            <label className={styles.login__field}>
              <span className={styles.login__label}>E-mail do cadastro</span>
              <input
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value.slice(0, 80))}
                placeholder="voce@email.com"
                className={styles.login__input}
              />
            </label>
            {error && <div className={styles.login__error}>{error}</div>}
            <button type="submit" hidden />
            <Button size="lg" full disabled={!emailOk || busy} onClick={submitEmail}>
              {busy ? 'Enviando…' : 'Receber código'}
            </Button>
          </form>
        ) : (
          <form className={styles.login__form} onSubmit={submitCode}>
            <div className={styles.login__heading}>
              <h1 className={styles.login__title}>Digite o código</h1>
              <div className={styles.login__hint}>Enviamos 6 dígitos para {maskEmail(email.trim())}.</div>
            </div>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              aria-label="Código de 6 dígitos"
              className={styles.login__code}
            />
            {error && <div className={styles.login__error}>{error}</div>}
            <button type="submit" hidden />
            <Button size="lg" full disabled={code.length !== 6 || busy} onClick={submitCode}>
              {busy ? 'Entrando…' : 'Entrar'}
            </Button>
            <div className={styles.login__links}>
              <button
                type="button"
                className={styles.login__link}
                onClick={() => {
                  setStep('email');
                  setCode('');
                  setError(null);
                }}
              >
                Trocar e-mail
              </button>
              <button type="button" className={resent ? styles.login__link_done : styles.login__link} onClick={resend}>
                {resent ? 'Código reenviado' : 'Reenviar código'}
              </button>
            </div>
          </form>
        )}
      </div>
      <div className={styles.login__signup}>
        Ainda não é afiliado? <a href={SIGNUP_URL} className={styles.login__signupLink}>Cadastre-se</a>
      </div>
    </div>
  );
}
