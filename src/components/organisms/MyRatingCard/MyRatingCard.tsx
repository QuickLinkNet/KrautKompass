import type { Rating } from '../../../api/types';
import { formatLongDate } from '../../../utils/format';
import { Button } from '../../atoms/Button/Button';
import { Card } from '../../atoms/Card/Card';
import { Icon } from '../../atoms/Icon/Icon';
import { RatingStars } from '../../atoms/RatingStars/RatingStars';
import styles from './MyRatingCard.module.css';

/** Eigene Bewertung auf der Sortenseite. */
export function MyRatingCard({ rating, onEdit }: { rating: Rating; onEdit: () => void }) {
  const shared = rating.visibility === 'group';
  return (
    <Card className={styles.card}>
      <h2 className={styles.title}>Deine Bewertung</h2>
      <RatingStars value={rating.overall} size="lg" />
      <p className={styles.meta}>
        <span><Icon name="calendar" size={16} />{formatLongDate(rating.consumedAt ?? rating.updatedAt)}</span>
        <span><Icon name={shared ? 'users' : 'lock'} size={16} />{shared ? 'Mit der Runde geteilt' : 'Nur für dich'}</span>
      </p>
      <Button type="button" block variant="secondary" className={styles.edit} onClick={onEdit}>Bewertung ändern</Button>
    </Card>
  );
}
