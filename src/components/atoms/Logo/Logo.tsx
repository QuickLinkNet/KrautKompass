import styles from './Logo.module.css';

interface LogoProps {
  size?: 'md' | 'lg';
  /** light = auf dunklen Markenflächen (Ink) */
  tone?: 'default' | 'light';
}

/** Wortmarke in Anlehnung an „Kraut Kurier“: zweifarbig, Kompassnadel als Trenner. */
export function Logo({ size = 'md', tone = 'default' }: LogoProps) {
  return (
    <span className={`${styles.logo} ${styles[size]} ${styles[tone]}`} role="img" aria-label="KrautKompass">
      <span className={styles.kraut}>Kraut</span>
      <svg className={styles.needle} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 3.5l2.6 8.5L12 20.5 9.4 12z" fill="currentColor" />
      </svg>
      <span className={styles.kompass}>Kompass</span>
    </span>
  );
}
