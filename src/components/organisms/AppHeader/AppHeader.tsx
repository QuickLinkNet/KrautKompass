import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { useSession } from '../../../features/session/sessionContext';
import { Icon, type IconName } from '../../atoms/Icon/Icon';
import { IconButton } from '../../atoms/IconButton/IconButton';
import { Logo } from '../../atoms/Logo/Logo';
import { AccountMenu } from './AccountMenu';
import styles from './AppHeader.module.css';

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
}

type OpenMenu = 'nav' | 'account' | null;

/**
 * Kopfzeile nach dem Login (Screendesign Sorte & Bewertung): Desktop einzeilig, Tablet mit
 * Navigation in zweiter Zeile, Handy mit Burger. Das Konto hängt überall am Initialen-Kreis.
 */
export function AppHeader() {
  const { user } = useSession();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const headerRef = useRef<HTMLElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);

  const links: NavItem[] = [
    { to: '/', label: 'Sortenkatalog', icon: 'compass', end: true },
    { to: '/bewertungen', label: 'Journal', icon: 'book' },
    { to: '/neuigkeiten', label: 'Neuigkeiten', icon: 'news' },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Verwaltung', icon: 'settings' as const }] : []),
  ];

  // Menüs schließen beim Seitenwechsel, Escape und Klick daneben
  useEffect(() => setOpenMenu(null), [location.pathname]);

  useEffect(() => {
    if (openMenu === null) return undefined;
    const root = openMenu === 'account' ? accountRef.current : headerRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpenMenu(null);
      // Fokus zurück auf den Auslöser, damit er nicht mit dem Menü verschwindet
      (openMenu === 'account' ? accountRef : burgerRef).current?.querySelector('button')?.focus();
    };
    const onClick = (e: MouseEvent) => {
      if (!root?.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [openMenu]);

  const toggle = (menu: 'nav' | 'account') => setOpenMenu(openMenu === menu ? null : menu);
  const navOpen = openMenu === 'nav';

  const navLinks = links.map((link) => (
    <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setOpenMenu(null)}
      className={({ isActive }) => {
        // Sortendetails gehören zum Katalog
        const active = isActive || (link.to === '/' && location.pathname.startsWith('/sorten/'));
        return `${styles.link} ${active ? styles.active : ''}`;
      }}>
      <Icon name={link.icon} size={20} />
      {link.label}
    </NavLink>
  ));

  return (
    <header className={styles.header} ref={headerRef}>
      <a href="#inhalt" className={styles.skip}>Zum Inhalt springen</a>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand} aria-label="KrautKompass – zum Sortenkatalog">
          <Logo size="md" />
        </NavLink>

        <nav className={styles.nav} aria-label="Hauptnavigation">{navLinks}</nav>

        <div className={styles.account} ref={accountRef}>
          <AccountMenu open={openMenu === 'account'} onToggle={() => toggle('account')} />
        </div>

        <div className={styles.burger} ref={burgerRef}>
          <IconButton icon={navOpen ? 'x' : 'menu'} label={navOpen ? 'Menü schließen' : 'Menü öffnen'}
            aria-expanded={navOpen} aria-controls="mobile-menu" onClick={() => toggle('nav')} />
        </div>
      </div>

      {navOpen && (
        <nav id="mobile-menu" aria-label="Hauptnavigation mobil" className={styles.mobileMenu}>{navLinks}</nav>
      )}
    </header>
  );
}
