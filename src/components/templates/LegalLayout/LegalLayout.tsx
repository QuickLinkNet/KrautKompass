import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Icon } from '../../atoms/Icon/Icon';
import { Logo } from '../../atoms/Logo/Logo';
import styles from './LegalLayout.module.css';

/** Schlichter Rahmen für Impressum und Datenschutz, erreichbar mit und ohne Anmeldung. */
export function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link to="/" aria-label="KrautKompass – zur Startseite"><Logo size="sm" /></Link>
      </header>
      <main className={styles.main} id="inhalt">
        <Link to="/" className={styles.back}><Icon name="arrowLeft" size={18} /> Zurück zur App</Link>
        <h1>{title}</h1>
        <div className={styles.text}>{children}</div>
        <nav className={styles.legal} aria-label="Rechtliches">
          <Link to="/impressum">Impressum</Link>
          <Link to="/datenschutz">Datenschutz</Link>
        </nav>
      </main>
    </div>
  );
}
