import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import logo from '../assets/fidz-logo-branca.png';
import { MenuIcon } from '../components/icons/Icons';
import { Sidebar } from './Sidebar';
import styles from './AffiliateShell.module.css';

export function AffiliateShell() {
  const location = useLocation();
  // Below 900px the sidebar is a drawer, opened from the top bar. Any navigation closes it.
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <div className={styles.shell}>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && <div className={styles.shell__backdrop} onClick={() => setMenuOpen(false)} />}
      <div className={styles.shell__main}>
        <div className={styles.shell__topBar} data-print-hide>
          <button type="button" className={styles.shell__menu} onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
            <MenuIcon />
          </button>
          <img src={logo} alt="Fidz" className={styles.shell__topLogo} />
          <span className={styles.shell__topTag}>Afiliados</span>
        </div>
        <main className={styles.shell__content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
