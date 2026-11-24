import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useSession } from '../../../features/session/sessionContext';
import { Logo } from '../../atoms/Logo/Logo';
import styles from './AppHeader.module.css';

export function AppHeader() {
  const { user, logout } = useSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: 'Sorten', end: true },
    { to: '/bewertungen', label: 'Meine Bewertungen' },
    { to: '/neuigkeiten', label: 'Neues aus der Runde' },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Verwaltung' }] : []),
  ];

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand} onClick={() => setOpen(false)}>
          <Logo />
        </NavLink>
        <button className={styles.burger} aria-expanded={open} aria-label="Menü" onClick={() => setOpen(!open)}>
          ☰
        </button>
        <nav className={`${styles.nav} ${open ? styles.open : ''}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <span className={styles.user}>{user?.display_name}</span>
          <button className={styles.logout} onClick={onLogout}>
            Abmelden
          </button>
        </nav>
      </div>
    </header>
  );
}
