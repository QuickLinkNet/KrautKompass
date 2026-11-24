import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { useSession } from '../../../features/session/sessionContext';
import { Icon, type IconName } from '../../atoms/Icon/Icon';
import { IconButton } from '../../atoms/IconButton/IconButton';
import { Logo } from '../../atoms/Logo/Logo';
import styles from './AppHeader.module.css';

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
}

function initials(name: string | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '')).toUpperCase() || '?';
}

/** Kopfzeile nach dem Login (Screendesign Sortenkatalog): Navigation, Konto-Menü, mobil Burger. */
export function AppHeader() {
  const { user, logout } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const links: NavItem[] = [
    { to: '/', label: 'Sortenkatalog', icon: 'compass', end: true },
    { to: '/bewertungen', label: 'Journal', icon: 'book' },
    { to: '/neuigkeiten', label: 'Neuigkeiten', icon: 'users' },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Verwaltung', icon: 'shield' as const }] : []),
  ];

  // Menüs schließen beim Seitenwechsel, Escape und Klick daneben
  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen && !accountOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setAccountOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [menuOpen, accountOpen]);

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = links.map((link) => (
    <NavLink key={link.to} to={link.to} end={link.end}
      className={({ isActive }) => {
        // Sortendetails gehören zum Katalog
        const active = isActive || (link.to === '/' && location.pathname.startsWith('/sorten/'));
        return `${styles.link} ${active ? styles.active : ''}`;
      }}>
      <Icon name={link.icon} size={18} />
      {link.label}
    </NavLink>
  ));

  return (
    <header className={styles.header}>
      <a href="#inhalt" className={styles.skip}>Zum Inhalt springen</a>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand} aria-label="KrautKompass – zum Sortenkatalog">
          <Logo size="md" />
        </NavLink>

        <nav className={styles.nav} aria-label="Hauptnavigation">{navLinks}</nav>

        <div className={styles.account} ref={accountRef}>
          <button type="button" className={styles.accountButton} aria-expanded={accountOpen} aria-haspopup="true"
            onClick={() => setAccountOpen(!accountOpen)}>
            <span className={styles.avatar} aria-hidden="true">{initials(user?.display_name)}</span>
            <span className={styles.srOnly}>Konto von {user?.display_name}</span>
            <Icon name="chevronDown" size={16} />
          </button>
          {accountOpen && (
            <div className={styles.accountMenu}>
              <p className={styles.accountName}>{user?.display_name}</p>
              <p className={styles.accountMail}>{user?.email}</p>
              <button type="button" className={styles.menuAction} onClick={onLogout}>
                <Icon name="logOut" size={18} /> Abmelden
              </button>
            </div>
          )}
        </div>

        <IconButton icon={menuOpen ? 'x' : 'menu'} label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
          aria-expanded={menuOpen} aria-controls="mobile-menu" className={styles.burger}
          onClick={() => setMenuOpen(!menuOpen)} />
      </div>

      {menuOpen && (
        <div id="mobile-menu" className={styles.mobileMenu}>
          <nav aria-label="Hauptnavigation mobil" className={styles.mobileNav}>{navLinks}</nav>
          <div className={styles.mobileUser}>
            <span className={styles.avatar} aria-hidden="true">{initials(user?.display_name)}</span>
            <span className={styles.mobileUserText}>
              <strong>{user?.display_name}</strong>
              <span>{user?.email}</span>
            </span>
          </div>
          <button type="button" className={styles.menuAction} onClick={onLogout}>
            <Icon name="logOut" size={18} /> Abmelden
          </button>
        </div>
      )}
    </header>
  );
}
