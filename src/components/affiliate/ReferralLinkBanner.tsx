import type { AffiliateProfile } from '../../types';
import { referralUrl, whatsappShareUrl } from '../../data/share';
import { useCopy } from '../../hooks/useCopy';
import { Button } from '../core/Button';
import styles from './ReferralLinkBanner.module.css';

export function ReferralLinkBanner({ profile }: { profile: AffiliateProfile }) {
  const { copied, copy } = useCopy();
  return (
    <div className={styles.banner}>
      <div className={styles.banner__text}>
        <div className={styles.banner__eyebrow}>Seu link de indicação</div>
        <div className={styles.banner__link}>{profile.link}</div>
        <div className={styles.banner__hint}>
          Ou peça para a loja digitar o código <span className={styles.banner__code}>{profile.code}</span> no cadastro.
        </div>
      </div>
      <div className={styles.banner__actions}>
        <Button variant="onPurple" onClick={() => copy(referralUrl(profile))}>
          {copied ? 'Copiado ✓' : 'Copiar link'}
        </Button>
        <Button variant="ghostOnPurple" onClick={() => window.open(whatsappShareUrl(profile), '_blank', 'noopener')}>
          Enviar no WhatsApp
        </Button>
      </div>
    </div>
  );
}
