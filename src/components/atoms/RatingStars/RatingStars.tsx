import { formatStarValue } from '../../../utils/format';
import { Icon } from '../Icon/Icon';
import styles from './RatingStars.module.css';

const STARS = [0, 1, 2, 3, 4];

interface RatingStarsProps {
  /** Durchschnitt auf der Skala 1–10 (null = noch keine Bewertung) */
  value: number | null;
  /** Anzahl der Bewertungen, in Klammern dahinter */
  count?: number;
  /** compact = nur ein Stern mit Zahl (kleine Karten) */
  compact?: boolean;
  size?: 'sm' | 'lg';
  /** long = „4,5 von 5 Sternen“, none = nur Sterne */
  text?: 'value' | 'long' | 'none';
}

/**
 * Sterne plus Zahl wie im Rest der App: interne Skala 1–10 wird als 0,5–5 Sterne gezeigt,
 * anteilig gefüllt. Die Sterne sind dekorativ, die Zahl (und das aria-label) trägt die Information.
 */
export function RatingStars({ value, count, compact = false, size = 'sm', text = 'value' }: RatingStarsProps) {
  if (value === null) {
    return <span className={styles.empty}>Noch keine Bewertung</span>;
  }
  const stars = formatStarValue(value);
  const percent = Math.max(0, Math.min(100, value * 10));
  const label = `${stars} von 5 Sternen${count !== undefined ? `, ${count} Bewertung${count === 1 ? '' : 'en'}` : ''}`;
  const iconSize = size === 'lg' ? 24 : 16;
  return (
    <span className={`${styles.rating} ${styles[size]}`} role="img" aria-label={label}>
      {compact ? (
        <Icon name="star" size={16} filled className={styles.star} />
      ) : (
        <span className={styles.stars} aria-hidden="true">
          <span className={styles.track}>
            {STARS.map((i) => <Icon key={i} name="star" size={iconSize} />)}
          </span>
          <span className={styles.fill} style={{ width: `${percent}%` }}>
            {STARS.map((i) => <Icon key={i} name="star" size={iconSize} filled />)}
          </span>
        </span>
      )}
      {text !== 'none' && (
        <span className={styles.value} aria-hidden="true">
          {stars}
          {text === 'long' && <span className={styles.unit}> von 5 Sternen</span>}
        </span>
      )}
      {count !== undefined && <span className={styles.count} aria-hidden="true">({count})</span>}
    </span>
  );
}
