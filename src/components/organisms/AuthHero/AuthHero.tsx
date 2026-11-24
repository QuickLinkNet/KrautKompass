import heroUrl from '../../../../design/assets/login-desktop.webp';
import { Logo } from '../../atoms/Logo/Logo';
import styles from './AuthHero.module.css';

/**
 * Bildbereich der Auth-Seiten (design/screens/01-login): Foto mit CSS-Verlauf,
 * Claim und Unterzeile als echter HTML-Text. Desktop: volle Höhe links mit Logo;
 * Tablet/Handy: Band über dem Formular (Logo sitzt dann im Kopf).
 */
export function AuthHero({ className }: { className?: string }) {
  return (
    <aside className={[styles.hero, className].filter(Boolean).join(' ')}>
      <img className={styles.photo} src={heroUrl} alt="" width={1200} height={1600} fetchPriority="high" />
      <div className={styles.scrim} />
      <div className={styles.content}>
        <Logo tone="light" size="md" className={styles.logo} />
        <div>
          <p className={styles.claim}>
            <span>Bewerten.</span> <span>Verstehen.</span> <span>Entdecken.</span>
          </p>
          <span className={styles.rule} />
          <p className={styles.tagline}>Dein privates Journal für medizinische Cannabis-Bewertungen.</p>
        </div>
      </div>
    </aside>
  );
}
