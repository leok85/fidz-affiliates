import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Button } from '../components/core/Button';
import { PROMO_ARTS, type PromoArt } from '../components/affiliate/PromoArts';
import { useProfile } from '../data/queries';
import { captionsFor } from '../data/share';
import { useCopy } from '../hooks/useCopy';
import shared from '../styles/shared.module.css';
import styles from './PromoScreen.module.css';

const EXPORT_WIDTH = 1080;

async function downloadArt(node: HTMLElement, fileName: string) {
  await document.fonts.ready;
  // The art's rounded corners are only for the preview; the exported image is a full rectangle.
  const art = node.firstElementChild as HTMLElement;
  const dataUrl = await toPng(art, { pixelRatio: EXPORT_WIDTH / art.offsetWidth, cacheBust: true, style: { borderRadius: '0' } });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  a.click();
}

export function PromoScreen() {
  const { data: profile } = useProfile();
  const nodes = useRef<Record<string, HTMLDivElement | null>>({});
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const { copied, copy } = useCopy<number>();

  if (!profile) return <div className={shared.loading}>Carregando…</div>;
  const code = profile.code;

  async function download(art: PromoArt) {
    const node = nodes.current[art.id];
    if (!node) return;
    setBusy(art.id);
    try {
      await downloadArt(node, `fidz-${art.id}-${code.toLowerCase()}.png`);
      setDownloaded((prev) => new Set(prev).add(art.id));
    } finally {
      setBusy(null);
    }
  }

  async function downloadAll() {
    for (const art of PROMO_ARTS) await download(art);
  }

  const allDone = downloaded.size === PROMO_ARTS.length;

  return (
    <>
      <div className={shared.pageHeader}>
        <div>
          <h1 className={shared.pageHeader__title}>Divulgar</h1>
          <div className={shared.pageHeader__subtitle}>Artes oficiais com o seu código. Pode postar no feed, nos stories ou impulsionar.</div>
        </div>
        <Button disabled={busy !== null} onClick={downloadAll}>
          {allDone ? 'Kit baixado ✓' : `Baixar as ${PROMO_ARTS.length} artes`}
        </Button>
      </div>

      <div className={styles.rules}>
        <div className={styles.rules__title}>Regras de uso</div>
        <div className={styles.rules__item}>Use só as artes desta página, sem editar.</div>
        <div className={styles.rules__item}>Não prometa aumento de vendas ou resultado para a loja.</div>
        <div className={styles.rules__item}>Não crie artes próprias com o logo da Fidz.</div>
      </div>

      <div className={styles.arts}>
        {PROMO_ARTS.map((art) => (
          <div key={art.id} className={styles.art}>
            <div ref={(el) => (nodes.current[art.id] = el)} className={styles.art__preview}>
              <art.Art code={code} />
            </div>
            <div className={styles.art__footer}>
              <div>
                <div className={styles.art__name}>{art.name}</div>
                <div className={styles.art__format}>{art.format === 'Post' ? 'Post · 1080×1350' : 'Story'}</div>
              </div>
              <Button variant="outline" size="sm" disabled={busy !== null} onClick={() => download(art)}>
                {busy === art.id ? 'Gerando…' : downloaded.has(art.id) ? 'Baixado ✓' : 'Baixar'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.captions}>
        <div className={shared.card__title}>Legendas prontas</div>
        <div className={styles.captions__grid}>
          {captionsFor(profile).map((c, i) => (
            <div key={c.where} className={styles.caption}>
              <div className={styles.caption__where}>{c.where}</div>
              <div className={styles.caption__text}>{c.text}</div>
              <Button variant="outline" size="sm" className={styles.caption__copy} onClick={() => copy(c.text, i)}>
                {copied === i ? 'Copiado ✓' : 'Copiar'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
