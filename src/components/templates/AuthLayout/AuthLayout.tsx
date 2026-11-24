import type { ReactNode } from 'react';
import { useSession } from '../../../features/session/sessionContext';
import { Logo } from '../../atoms/Logo/Logo';
import { AuthHero } from '../../organisms/AuthHero/AuthHero';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Bereich unter dem Formular (Alternativen, Hinweise, Rücklinks) */
  footer?: ReactNode;
}

/**
 * Template für Login, Registrierung, Einrichtung und Passwort-Reset
 * (Referenz: design/screens/01-login/reference.png).
 *  - Desktop ≥ 1024 px: Split 52:48, links Foto (fixiert), rechts Formular, max. 440 px
 *  - Tablet/Handy: Kopf mit Logo, Bildband, Formular als Karte darunter
 * Bewusst ohne Navigation.
 */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const legal = useSession().status?.legal;

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Logo size="sm" />
      </header>
      <AuthHero className={styles.hero} />
      <main className={styles.main}>
        <div className={styles.box}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {children}
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
        {(legal?.imprintUrl || legal?.privacyUrl) && (
          <nav className={styles.legal} aria-label="Rechtliches">
            {legal.imprintUrl && <a href={legal.imprintUrl} rel="noopener">Impressum</a>}
            {legal.privacyUrl && <a href={legal.privacyUrl} rel="noopener">Datenschutz</a>}
          </nav>
        )}
      </main>
    </div>
  );
}
