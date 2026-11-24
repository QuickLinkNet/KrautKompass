import { CompassRose } from '../../atoms/CompassRose/CompassRose';
import { Logo } from '../../atoms/Logo/Logo';
import styles from './BrandPanel.module.css';

const POINTS = [
  { title: 'Sorten festhalten', text: 'Geschmack, Aroma und Wirkung – in halben Sternen.' },
  { title: 'Muster erkennen', text: 'Welche Terpene und Hersteller passen zu dir?' },
  { title: 'In der Runde teilen', text: 'Nur wenn du willst. Standard ist privat.' },
];

/** Dunkles Markenpanel für Login, Registrierung und Einrichtung. */
export function BrandPanel() {
  return (
    <aside className={styles.panel}>
      <CompassRose className={styles.rose} />
      <div className={styles.content}>
        <Logo size="lg" tone="light" />
        <div className={styles.copy}>
          <p className={styles.overline}>Private Runde</p>
          <h2 className={styles.headline}>Dein Kompass durchs Kraut-Kurier-Sortiment.</h2>
          <ul className={styles.points}>
            {POINTS.map((p) => (
              <li key={p.title}>
                <span className={styles.pointTitle}>{p.title}</span>
                <span className={styles.pointText}>{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className={styles.footnote}>Zugang nur mit Einladung · keine Werbung · keine Kaufempfehlung</p>
      </div>
    </aside>
  );
}
