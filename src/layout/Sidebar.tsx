import { NavLink } from 'react-router-dom';
import logo from '../assets/fidz-logo-branca.png';
import { useAuth } from '../auth/AuthContext';
import { useProfile } from '../data/queries';
import { CloseIcon } from '../components/icons/Icons';
import { initialsFor, monthYear } from '../utils/format';
import { cx } from '../utils/cx';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { path: '/', name: 'Início' },
  { path: '/indicacoes', name: 'Indicações' },
  { path: '/ganhos', name: 'Ganhos e saque' },
  { path: '/metas', name: 'Metas' },
  { path: '/divulgar', name: 'Divulgar' },
  // Só pessoa física recebe informe de rendimentos (RPA); PJ emite a própria nota.
  { path: '/informe', name: 'Informe de rendimentos', pfOnly: true }
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const items = NAV_ITEMS.filter((item) => !item.pfOnly || profile?.personType === 'PF');

  return (
    <div className={cx(styles.sidebar, open && styles.sidebar_open)} data-print-hide>
      <div className={styles.sidebar__brand}>
        <img src={logo} alt="Fidz" className={styles.sidebar__logo} />
        <span className={styles.sidebar__tag}>Afiliados</span>
        <button type="button" className={styles.sidebar__close} onClick={onClose} aria-label="Fechar menu">
          <CloseIcon />
        </button>
      </div>

      <nav className={styles.sidebar__nav}>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) => cx(styles.sidebar__navItem, isActive && styles.sidebar__navItem_active)}
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className={styles.sidebar__footer}>
        <div className={styles.sidebar__avatar}>{profile ? initialsFor(profile.name) : '…'}</div>
        <div className={styles.sidebar__identity}>
          <div className={styles.sidebar__name}>{profile?.name ?? 'Carregando…'}</div>
          {/* O design diz "Afiliada desde"; sem o gênero no cadastro, fica a forma neutra. */}
          {profile && <div className={styles.sidebar__since}>Desde {monthYear(profile.since)}</div>}
        </div>
        <button type="button" className={styles.sidebar__logout} onClick={signOut}>
          Sair
        </button>
      </div>
    </div>
  );
}
