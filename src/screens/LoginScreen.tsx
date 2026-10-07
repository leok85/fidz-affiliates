import { useState, type FormEvent } from 'react';
import logo from '../assets/fidz-logo-branca.png';
import { useAuth } from '../auth/AuthContext';
import { maskEmail } from '../utils/format';
import { cx } from '../utils/cx';
import styles from './LoginScreen.module.css';

const SIGNUP_URL = 'https://fidz.com.br/afiliados';
const SUPPORT_EMAIL = 'suporte@fidz.com.br';
const EMAIL_RE = /.+@.+\..+/;

function BackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 6l-6 6 6 6"></path>
    </svg>
  );
}

/* Ilustração do lado esquerdo: dois cartões do painel, com os valores de exemplo do design. */
function PanelPreview() {
  return (
    <div className={styles.preview} aria-hidden="true">
      <div className={styles.preview__balance}>
        <div className={styles.preview__label}>Disponível para saque</div>
        <div className={styles.preview__amount}>R$ 237,60</div>
        <div className={cx(styles.preview__row, styles.preview__row_first)}>
          <span className={styles.preview__label}>Em carência</span>
          <span className={styles.preview__value}>R$ 39,60</span>
        </div>
        <div className={styles.preview__row}>
          <span className={styles.preview__label}>Lojas ativas</span>
          <span className={styles.preview__value}>3</span>
        </div>
        <div className={styles.preview__button}>Sacar no Pix</div>
      </div>
      <div className={styles.preview__goal}>
        <div className={styles.preview__goalHead}>
          <span>Próxima faixa</span>
          <span>Bronze</span>
        </div>
        <div className={styles.preview__prize}>Kit Fidz</div>
        <div className={styles.preview__track}>
          <div className={styles.preview__fill} />
        </div>
        <div className={styles.preview__goalNote}>13.002 de 24.000 pontos</div>
      </div>
    </div>
  );
}

export function LoginScreen() {
  const { sendCode, verifyCode, authError } = useAuth();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [codeError, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const error = codeError ?? authError;

  const emailOk = EMAIL_RE.test(email.trim());

  async function submitEmail(e?: FormEvent) {
    e?.preventDefault();
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

  async function submitCode(e?: FormEvent) {
    e?.preventDefault();
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
      <div className={styles.login__hero}>
        <div className={styles.login__brand}>
          <img src={logo} alt="Fidz" className={styles.login__logo} />
          <span className={styles.login__tag}>Afiliados</span>
        </div>
        <h1 className={styles.login__headline}>
          Suas indicações viram <span className={styles.login__accent}>comissão</span>
        </h1>
        <div className={styles.login__lead}>Comissões, saques e metas das lojas que você indicou.</div>
        <PanelPreview />
        <div className={styles.login__support}>
          Dúvida no acesso? Escreva para{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className={styles.login__supportLink}>
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>

      <div className={styles.login__side}>
        <div className={styles.login__card}>
          {step === 'email' ? (
            <form onSubmit={submitEmail}>
              <h2 className={styles.login__title}>Entrar no painel</h2>
              <div className={styles.login__hint}>Use o e-mail do seu cadastro de afiliado. Enviamos um código de 6 dígitos.</div>
              <label className={styles.login__field}>
                <span className={styles.login__label}>E-mail</span>
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
              <button type="submit" disabled={!emailOk || busy} className={cx(styles.login__submit, (!emailOk || busy) && styles.login__submit_disabled)}>
                {busy ? 'Enviando…' : 'Receber código'}
              </button>
            </form>
          ) : (
            <form onSubmit={submitCode}>
              <button
                type="button"
                className={styles.login__back}
                onClick={() => {
                  setStep('email');
                  setCode('');
                  setError(null);
                }}
              >
                <BackIcon />
                Trocar e-mail
              </button>
              <h2 className={cx(styles.login__title, styles.login__title_afterBack)}>Digite o código</h2>
              <div className={styles.login__hint}>Enviamos 6 dígitos para {maskEmail(email.trim())}.</div>
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
              <button type="submit" disabled={code.length !== 6 || busy} className={cx(styles.login__submit, (code.length !== 6 || busy) && styles.login__submit_disabled)}>
                {busy ? 'Entrando…' : 'Entrar'}
              </button>
              <div className={styles.login__resend}>
                Não chegou?
                <button type="button" className={cx(styles.login__resendLink, resent && styles.login__resendLink_done)} onClick={resend}>
                  {resent ? 'Código reenviado' : 'Reenviar código'}
                </button>
              </div>
            </form>
          )}
          <div className={styles.login__signup}>
            Ainda não é afiliado?
            <a href={SIGNUP_URL} className={styles.login__signupLink}>
              Cadastre-se
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
