import type { ComponentType } from 'react';
import logo from '../../assets/fidz-logo-tight.png';
import styles from './PromoArts.module.css';

/*
 * As artes oficiais da tela Divulgar, desenhadas como no projeto de design. Cada uma é renderizada
 * na tela no tamanho de prévia (232×290 post, 163×290 story) e exportada em PNG em 1080 px de largura.
 */

export interface PromoArt {
  id: string;
  name: string;
  format: 'Post' | 'Story';
  Art: ComponentType<{ code: string }>;
}

function Logo({ boxed = false, small = false }: { boxed?: boolean; small?: boolean }) {
  const img = <img src={logo} alt="Fidz" className={small ? styles.logo_sm : styles.logo} />;
  return boxed ? <div className={small ? styles.logoBox_sm : styles.logoBox}>{img}</div> : img;
}

function ReasonToReturn({ code }: { code: string }) {
  return (
    <div className={styles.reason}>
      <Logo boxed />
      <div className={styles.reason__title}>Seu cliente volta quando tem motivo.</div>
      <div className={styles.reason__chips}>
        <span className={styles.reason__chip}>Selos</span>
        <span className={styles.reason__chip}>Pontos</span>
        <span className={styles.reason__chip}>Cashback</span>
      </div>
      <div className={styles.reason__code}>
        <span className={styles.reason__codeLabel}>Cadastre com o código</span>
        <span className={styles.reason__codeValue}>{code}</span>
      </div>
    </div>
  );
}

function ThreeBands({ code }: { code: string }) {
  return (
    <div className={styles.bands}>
      <div className={styles.bands__top}>
        <Logo />
        <div className={styles.bands__title}>
          Três jeitos de fazer seu cliente <span className={styles.bands__accent}>voltar.</span>
        </div>
      </div>
      <div className={styles.bands__rows}>
        <div className={styles.bands__stamps}>
          <span className={styles.bands__nameLight}>Selos</span>
          <span className={styles.bands__stars}>★★★★☆</span>
        </div>
        <div className={styles.bands__points}>
          <span className={styles.bands__nameDark}>Pontos</span>
          <span className={styles.bands__figureDark}>+120</span>
        </div>
        <div className={styles.bands__cashback}>
          <span className={styles.bands__namePurple}>Cashback</span>
          <span className={styles.bands__figurePurple}>R$ 8,40</span>
        </div>
      </div>
      <div className={styles.bands__footer}>
        <span className={styles.footLabel}>Código no cadastro</span>
        <span className={styles.footCode}>{code}</span>
      </div>
    </div>
  );
}

function CounterPhrases({ code }: { code: string }) {
  return (
    <div className={styles.phrases}>
      <Logo />
      <div className={styles.phrases__title}>Frases que você vai ouvir no balcão.</div>
      <div className={styles.phrases__bubble}>"Falta 1 selo pro meu prêmio!"</div>
      <div className={styles.phrases__bubble}>"Juntei 300 pontos, hoje eu troco."</div>
      <div className={styles.phrases__bubble}>"Usa meu cashback aí."</div>
      <div className={styles.phrases__reply}>"Pode deixar, tá no Fidz."</div>
      <div className={styles.phrases__code}>
        <span className={styles.footLabel}>Código no cadastro</span>
        <span className={styles.footCode_purple}>{code}</span>
      </div>
    </div>
  );
}

function Menu({ code }: { code: string }) {
  const items = [
    ['Selos', 'a cada visita'],
    ['Pontos', 'a cada real'],
    ['Cashback', 'de volta na compra']
  ];
  return (
    <div className={styles.menu}>
      <div className={styles.menu__paper}>
        <img src={logo} alt="Fidz" className={styles.logo_xs} />
        <div className={styles.menu__eyebrow}>Especial da casa</div>
        <div className={styles.menu__title}>Cardápio de fidelidade</div>
        <div className={styles.menu__items}>
          {items.map(([name, detail]) => (
            <div key={name} className={styles.menu__item}>
              <span className={styles.menu__name}>{name}</span>
              <span className={styles.menu__dots} />
              <span className={styles.menu__detail}>{detail}</span>
            </div>
          ))}
        </div>
        <div className={styles.menu__footer}>
          <span className={styles.menu__footLabel}>Código no cadastro</span>
          <span className={styles.footCode}>{code}</span>
        </div>
      </div>
    </div>
  );
}

function LiveToday({ code }: { code: string }) {
  return (
    <div className={styles.live}>
      <Logo boxed />
      <div className={styles.live__title}>Sua fidelidade no ar hoje.</div>
      <div className={styles.live__text}>Você escolhe selos, pontos ou cashback e configura tudo pelo celular.</div>
      <div className={styles.live__code}>
        <span className={styles.live__codeLabel}>Cadastre com o código</span>
        <span className={styles.live__codeValue}>{code}</span>
      </div>
    </div>
  );
}

function Poll({ code }: { code: string }) {
  return (
    <div className={styles.poll}>
      <Logo boxed small />
      <div className={styles.poll__title}>Sua loja tem fidelidade?</div>
      <div className={styles.poll__options}>
        <div className={styles.poll__yes}>Sim</div>
        <div className={styles.poll__no}>Ainda não</div>
      </div>
      <div className={styles.poll__foot}>
        Comece com selos, pontos ou cashback. Código <span className={styles.poll__code}>{code}</span>
      </div>
    </div>
  );
}

function ThreeWays({ code }: { code: string }) {
  return (
    <div className={styles.ways}>
      <Logo boxed small />
      <div className={styles.ways__eyebrow}>Escolha como recompensar</div>
      <div className={styles.ways__list}>
        <span className={styles.ways__one}>Selos.</span>
        <span className={styles.ways__two}>Pontos.</span>
        <span className={styles.ways__three}>Cashback.</span>
      </div>
      <div className={styles.ways__code}>
        <span className={styles.ways__codeLabel}>Código no cadastro</span>
        <span className={styles.ways__codeValue}>{code}</span>
      </div>
    </div>
  );
}

function CodeStory({ code }: { code: string }) {
  return (
    <div className={styles.codeStory}>
      <img src={logo} alt="Fidz" className={styles.logo_lg} />
      <div className={styles.codeStory__label}>Cadastre sua loja com o código</div>
      <div className={styles.codeStory__code}>{code}</div>
      <div className={styles.codeStory__text}>Fidelidade com selos, pontos ou cashback.</div>
      <div className={styles.codeStory__foot}>Link na bio</div>
    </div>
  );
}

export const PROMO_ARTS: PromoArt[] = [
  { id: 'motivo-para-voltar', name: 'Motivo para voltar', format: 'Post', Art: ReasonToReturn },
  { id: 'tres-faixas', name: 'Três faixas', format: 'Post', Art: ThreeBands },
  { id: 'frases-do-balcao', name: 'Frases do balcão', format: 'Post', Art: CounterPhrases },
  { id: 'cardapio', name: 'Cardápio', format: 'Post', Art: Menu },
  { id: 'no-ar-hoje', name: 'No ar hoje', format: 'Post', Art: LiveToday },
  { id: 'enquete', name: 'Enquete', format: 'Story', Art: Poll },
  { id: 'tres-jeitos', name: 'Três jeitos', format: 'Story', Art: ThreeWays },
  { id: 'codigo', name: 'Código', format: 'Story', Art: CodeStory }
];
