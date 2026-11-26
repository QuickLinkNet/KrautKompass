import { Link } from 'react-router';
import type { Rating } from '../../../api/types';
import { Icon } from '../../atoms/Icon/Icon';
import { RatingStars } from '../../atoms/RatingStars/RatingStars';
import styles from './JournalTop3.module.css';

/** „Deine Top 3“: am Handy eine wischbare Reihe, ab Tablet drei Spalten. */
export function JournalTop3({ ratings }: { ratings: Rating[] }) {
  if (ratings.length === 0) return null;
  return (
    <section className={styles.top} aria-labelledby="journal-top">
      <h2 id="journal-top" className={styles.title}>Deine Top {ratings.length}</h2>
      <ol className={styles.list}>
        {ratings.map((r) => (
          <li key={r.id} className={styles.item}>
            <span className={styles.media}>
              {r.productThumbUrl
                ? <img src={r.productThumbUrl} alt="" loading="lazy" decoding="async" />
                : <Icon name="leaf" size={24} />}
            </span>
            <span className={styles.body}>
              <Link to={`/sorten/${r.productId}`} className={styles.name}>{r.productName}</Link>
              <RatingStars value={r.overall} />
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
