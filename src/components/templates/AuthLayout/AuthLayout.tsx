import type { ReactNode } from 'react';
import { CompassRose } from '../../atoms/CompassRose/CompassRose';
import { Logo } from '../../atoms/Logo/Logo';
import { BrandPanel } from '../../organisms/BrandPanel/BrandPanel';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  /** kleine Zeile über dem Titel, z. B. Name der Runde */
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Split-Layout für Login, Registrierung und Einrichtung:
 * links Markenpanel (ab Tablet), rechts das Formular. Mobil: kompakter Markenkopf.
 */
export function AuthLayout({ title, subtitle, eyebrow, children, footer }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <BrandPanel />
      <header className={styles.mobileBrand}>
        <Logo tone="light" />
        <CompassRose className={styles.mobileRose} />
      </header>
      <main className={styles.formSide}>
        <div className={styles.formBox}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {children}
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </main>
    </div>
  );
}
