import { Link } from 'react-router';
import type { Rating } from '../../../api/types';
import { effectIcon } from '../../../features/catalog/catalogQuery';
import { formatTime, wasUpdated } from '../../../features/feed/feedGroups';
import { methodIcon } from '../../../features/journal/methodIcon';
import { Avatar } from '../../atoms/Avatar/Avatar';
import { Badge } from '../../atoms/Badge/Badge';
import { Icon } from '../../atoms/Icon/Icon';
import { RatingStars } from '../../atoms/RatingStars/RatingStars';
import styles from './FeedEntry.module.css';

interface FeedEntryProps {
  rating: Rating;
  label: { effect: (key: string) => string; sideEffect: (key: string) => string; method: (key: string) => string };
}

/** Eintrag „Kathrin hat … bewertet“; die ganze Karte führt zur Sortenseite. */
export function FeedEntry({ rating: r, label }: FeedEntryProps) {
  const who = r.isMine ? 'Du hast' : `${r.author.name ?? 'Jemand'} hat`;
  return (
    <article className={styles.entry}>
      <div className={styles.who}>
        <Avatar name={r.author.name} />
        <div>
          <p className={styles.sentence}>
            {who} <Link to={`/sorten/${r.productId}`} className={styles.link}>{r.productName}</Link> bewertet.
          </p>
          <p className={styles.time}>
            {formatTime(r.updatedAt)}
            {wasUpdated(r) && <span className={styles.updated}>aktualisiert</span>}
          </p>
        </div>
      </div>

      <span className={styles.media}>
        {r.productThumbUrl ? <img src={r.productThumbUrl} alt="" loading="lazy" decoding="async" /> : <Icon name="leaf" size={20} />}
      </span>

      <div className={styles.rating}>
        <RatingStars value={r.overall} />
        {r.method && <span className={styles.method}><Icon name={methodIcon(r.method)} size={16} />{label.method(r.method)}</span>}
      </div>

      {(r.effects.length > 0 || r.sideEffects.length > 0) && (
        <div className={styles.tags}>
          {r.effects.slice(0, 3).map((e) => <Badge key={e} tone="effect" icon={effectIcon(e)}>{label.effect(e)}</Badge>)}
          {r.sideEffects.map((s) => <Badge key={s} tone="danger">{label.sideEffect(s)}</Badge>)}
        </div>
      )}

      {r.notes && <p className={styles.notes}>{r.notes}</p>}
      <Icon name="arrowRight" size={18} className={styles.chevron} />
    </article>
  );
}
