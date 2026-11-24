import heroUrl from '../../../../design/assets/login-desktop.webp';
import styles from './CatalogHero.module.css';

/** Kopfbereich des Sortenkatalogs: grünes Band mit Foto rechts (Screendesign Sortenkatalog). */
export function CatalogHero() {
  return (
    <section className={styles.hero} aria-labelledby="catalog-title">
      <img className={styles.photo} src={heroUrl} alt="" width={1200} height={1600} />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Produktkatalog</p>
        <h1 id="catalog-title" className={styles.title}>Cannabis-Sorten entdecken.</h1>
        <p className={styles.lead}>Medizinische Cannabis-Produkte recherchieren, vergleichen und filtern.</p>
      </div>
    </section>
  );
}
