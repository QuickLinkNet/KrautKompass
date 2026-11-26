import type { Rating } from '../../../api/types';
import { formatLongDate } from '../../../utils/format';
import { Button } from '../../atoms/Button/Button';
import { Card } from '../../atoms/Card/Card';
import { Icon } from '../../atoms/Icon/Icon';
import { RatingStars } from '../../atoms/RatingStars/RatingStars';
import styles from './MyRatings.module.css';

interface MyRatingsProps {
  ratings: Rating[];
  onEdit: (rating: Rating) => void;
  onNew: () => void;
}

/** Eigene Bewertungen auf der Sortenseite (Tagebuch: mehrere möglich), jede einzeln änderbar. */
export function MyRatings({ ratings, onEdit, onNew }: MyRatingsProps) {
  return (
    <Card className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>{ratings.length === 1 ? 'Deine Bewertung' : `Deine Bewertungen (${ratings.length})`}</h2>
        <Button type="button" size="sm" variant="secondary" icon="plusSquare" className={styles.new} onClick={onNew}>
          Neue Bewertung
        </Button>
      </div>
      <ul className={styles.list}>
        {ratings.map((r) => {
          const shared = r.visibility === 'group';
          return (
            <li key={r.id} className={styles.item}>
              <div className={styles.info}>
                <RatingStars value={r.overall} />
                <p className={styles.meta}>
                  <span><Icon name="calendar" size={16} />{formatLongDate(r.consumedAt ?? r.createdAt)}</span>
                  <span><Icon name={shared ? 'users' : 'lock'} size={16} />{shared ? 'Mit der Runde geteilt' : 'Nur für dich'}</span>
                </p>
              </div>
              <Button type="button" size="sm" variant="ghost" icon="pencil" onClick={() => onEdit(r)}
                aria-label={`Bewertung vom ${formatLongDate(r.consumedAt ?? r.createdAt)} bearbeiten`}>
                Bearbeiten
              </Button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
