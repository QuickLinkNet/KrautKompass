import heroUrl from '../../../../design/assets/login-mobile.webp';
import styles from './PageHero.module.css';

interface PageHeroProps {
  id: string;
  title: string;
  lead: string;
  eyebrow?: string;
  /** Unterzeile auch auf dem Handy zeigen (Katalog: erst ab Tablet) */
  leadOnPhone?: boolean;
}

/** Grünes Kopfband mit Foto rechts (Sortenkatalog, Neuigkeiten). */
export function PageHero({ id, title, lead, eyebrow, leadOnPhone = false }: PageHeroProps) {
  return (
    <section className={styles.hero} aria-labelledby={id}>
      {/* Querformat-Foto (1536 × 1024), dasselbe wie im Login-Band auf Handy und Tablet */}
      <img className={styles.photo} src={heroUrl} alt="" width={1536} height={1024} />
      <div className={styles.inner}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 id={id} className={styles.title}>{title}</h1>
        <p className={`${styles.lead} ${leadOnPhone ? styles.leadPhone : ''}`}>{lead}</p>
      </div>
    </section>
  );
}
