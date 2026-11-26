import { Link } from 'react-router';
import type { Rating } from '../../../api/types';
import { effectIcon } from '../../../features/catalog/catalogQuery';
import { methodIcon } from '../../../features/journal/methodIcon';
import { formatDate } from '../../../utils/format';
import { Badge } from '../../atoms/Badge/Badge';
import { Button } from '../../atoms/Button/Button';
import { Icon } from '../../atoms/Icon/Icon';
import { RatingStars } from '../../atoms/RatingStars/RatingStars';
import styles from './JournalRatingCard.module.css';

interface JournalRatingCardProps {
  rating: Rating;
  label: { effect: (key: string) => string; sideEffect: (key: string) => string; method: (key: string) => string };
  onEdit: (rating: Rating) => void;
}

const AGAIN = { yes: 'Würde ich wieder nehmen', maybe: 'Vielleicht wieder', no: 'Würde ich nicht wieder nehmen' } as const;

/** Eigene Bewertung im Journal. Der Name führt zur Sortenseite, „Bearbeiten“ öffnet direkt das Bewerten. */
export function JournalRatingCard({ rating: r, label, onEdit }: JournalRatingCardProps) {
  const shared = r.visibility === 'group';
  return (
    <article className={styles.card}>
      <span className={styles.media}>
        {r.productThumbUrl ? <img src={r.productThumbUrl} alt="" loading="lazy" decoding="async" /> : <Icon name="leaf" size={24} />}
      </span>

      <div className={styles.main}>
        <h3 className={styles.name}><Link to={`/sorten/${r.productId}`}>{r.productName}</Link></h3>
        <RatingStars value={r.overall} />
        <p className={styles.facts}>
          <span><Icon name="calendar" size={16} />Probiert am {formatDate(r.consumedAt ?? r.updatedAt)}</span>
          {r.method && <span><Icon name={methodIcon(r.method)} size={16} />{label.method(r.method)}</span>}
        </p>
      </div>

      <div className={styles.details}>
        {r.effects.length > 0 && (
          <div className={styles.tags}>
            {r.effects.slice(0, 3).map((e) => <Badge key={e} tone="effect" icon={effectIcon(e)}>{label.effect(e)}</Badge>)}
          </div>
        )}
        {r.sideEffects.length > 0 && (
          <div className={styles.tags}>
            {r.sideEffects.map((s) => <Badge key={s} tone="danger">{label.sideEffect(s)}</Badge>)}
          </div>
        )}
        {r.notes && <p className={styles.notes}>{r.notes}</p>}
      </div>

      <div className={styles.side}>
        <span className={styles.visibility}>
          <Icon name={shared ? 'users' : 'lock'} size={16} />{shared ? 'Mit der Runde geteilt' : 'Nur für dich'}
        </span>
        {r.again && <Badge tone={r.again === 'yes' ? 'success' : 'neutral'} icon={r.again === 'yes' ? 'check' : undefined}>{AGAIN[r.again]}</Badge>}
        <Button size="sm" variant="secondary" icon="pencil" className={styles.edit} onClick={() => onEdit(r)}>Bearbeiten</Button>
      </div>
    </article>
  );
}
