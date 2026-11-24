import { Icon } from '../Icon/Icon';
import styles from './RatingStars.module.css';

const score = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

interface RatingStarsProps {
  /** Durchschnitt auf der Skala 1–10 (null = noch keine Bewertung) */
  value: number | null;
  /** Anzahl der Bewertungen, in Klammern dahinter */
  count?: number;
  /** compact = nur ein Stern mit Zahl (kleine Karten) */
  compact?: boolean;
}

/**
 * Sterne plus Zahl wie im Rest der App: interne Skala 1–10 wird als 0,5–5 Sterne gezeigt.
 * Die Sterne sind dekorativ, die Zahl (und das aria-label) trägt die Information.
 */
export function RatingStars({ value, count, compact = false }: RatingStarsProps) {
  if (value === null) {
    return <span className={styles.empty}>Noch keine Bewertung</span>;
  }
  const stars = value / 2;
  const percent = Math.max(0, Math.min(100, stars * 20));
  const label = `${score.format(stars)} von 5 Sternen${count !== undefined ? `, ${count} Bewertung${count === 1 ? '' : 'en'}` : ''}`;
  return (
    <span className={styles.rating} role="img" aria-label={label}>
      {compact ? (
        <Icon name="star" size={16} filled className={styles.star} />
      ) : (
        <span className={styles.stars} aria-hidden="true">
          <span className={styles.track}>
            {[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" size={16} />)}
          </span>
          <span className={styles.fill} style={{ width: `${percent}%` }}>
            {[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" size={16} filled />)}
          </span>
        </span>
      )}
      <span className={styles.value} aria-hidden="true">{score.format(stars)}</span>
      {count !== undefined && <span className={styles.count} aria-hidden="true">({count})</span>}
    </span>
  );
}
