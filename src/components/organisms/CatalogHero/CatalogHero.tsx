// Querformat-Foto (1536 × 1024), dasselbe wie im Login-Band auf Handy und Tablet
import heroUrl from '../../../../design/assets/login-mobile.webp';
import styles from './CatalogHero.module.css';

/** Kopfbereich des Sortenkatalogs: grünes Band mit Foto rechts (Screendesign Sortenkatalog). */
export function CatalogHero() {
  return (
    <section className={styles.hero} aria-labelledby="catalog-title">
      <img className={styles.photo} src={heroUrl} alt="" width={1536} height={1024} />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Produktkatalog</p>
        <h1 id="catalog-title" className={styles.title}>Cannabis-Sorten entdecken.</h1>
        <p className={styles.lead}>Medizinische Cannabis-Produkte recherchieren, vergleichen und filtern.</p>
      </div>
    </section>
  );
}
