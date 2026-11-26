import type { Meta, Rating } from '../../../api/types';
import { labelFor } from '../../../features/meta/useMeta';
import { formatLongDate } from '../../../utils/format';
import { Avatar } from '../../atoms/Avatar/Avatar';
import { Badge } from '../../atoms/Badge/Badge';
import { Card } from '../../atoms/Card/Card';
import { Icon } from '../../atoms/Icon/Icon';
import { RatingStars } from '../../atoms/RatingStars/RatingStars';
import styles from './RoundRatings.module.css';

/** Geteilte Bewertungen einer Sorte. */
export function RoundRatings({ ratings, meta }: { ratings: Rating[]; meta: Meta | null }) {
  return (
    <Card>
      <h2>Bewertungen der Runde</h2>
      {ratings.length === 0 ? (
        <p className={styles.empty}>
          <Icon name="leaf" size={24} />
          Noch niemand hat diese Sorte mit der Runde geteilt.
        </p>
      ) : (
        <ul className={styles.list}>
          {ratings.map((r) => <RoundRating key={r.id} rating={r} meta={meta} />)}
        </ul>
      )}
    </Card>
  );
}

function RoundRating({ rating: r, meta }: { rating: Rating; meta: Meta | null }) {
  return (
    <li className={styles.item}>
      <div className={styles.head}>
        <Avatar name={r.author.name} />
        <div className={styles.who}>
          <strong>{r.isMine ? 'Du' : r.author.name}</strong>
          <span className={styles.date}>{formatLongDate(r.consumedAt ?? r.updatedAt)}</span>
        </div>
        <RatingStars value={r.overall} />
      </div>
      {(r.method || r.effects.length > 0 || r.sideEffects.length > 0) && (
        <dl className={styles.details}>
          {r.method && (
            <div>
              <dt>Konsumform</dt>
              <dd><Badge tone="plain">{labelFor(meta?.methods, r.method)}</Badge></dd>
            </div>
          )}
          {r.effects.length > 0 && (
            <div>
              <dt>Wirkung</dt>
              <dd>{r.effects.map((e) => <Badge key={e} tone="effect">{labelFor(meta?.effects, e)}</Badge>)}</dd>
            </div>
          )}
          {r.sideEffects.length > 0 && (
            <div>
              <dt>Nebenwirkungen</dt>
              <dd>{r.sideEffects.map((e) => <Badge key={e} tone="danger">{labelFor(meta?.sideEffects, e)}</Badge>)}</dd>
            </div>
          )}
        </dl>
      )}
      {r.notes && <p className={styles.notes}>{r.notes}</p>}
    </li>
  );
}
