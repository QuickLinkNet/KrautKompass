import { Link } from 'react-router';
import type { Rating } from '../../../api/types';
import { labelFor, useMeta } from '../../../features/meta/useMeta';
import { formatDate, formatStars } from '../../../utils/format';
import { Badge } from '../../atoms/Badge/Badge';
import styles from './RatingList.module.css';

/** Liste von Bewertungen; mit showProduct für Feed und „Meine Bewertungen“. */
export function RatingList({ ratings, showProduct = false, empty }: {
  ratings: Rating[];
  showProduct?: boolean;
  empty: string;
}) {
  const meta = useMeta();
  if (ratings.length === 0) return <p className={styles.empty}>{empty}</p>;

  return (
    <ul className={styles.list}>
      {ratings.map((r) => (
        <li key={r.id} className={styles.item}>
          {showProduct && r.productThumbUrl && <img src={r.productThumbUrl} alt="" className={styles.thumb} />}
          <div className={styles.content}>
            <div className={styles.head}>
              {showProduct ? (
                <Link to={`/sorten/${r.productId}`} className={styles.product}>{r.productName}</Link>
              ) : (
                <strong>{r.isMine ? 'Du' : r.author.name}</strong>
              )}
              <span className={styles.score}>{formatStars(r.overall)}</span>
              {r.visibility === 'private' && <Badge>privat</Badge>}
            </div>
            <p className={styles.meta}>
              {showProduct && <>{r.isMine ? 'Du' : r.author.name} · </>}
              {formatDate(r.consumedAt ?? r.updatedAt)}
              {r.method && <> · {labelFor(meta?.methods, r.method)}</>}
            </p>
            {r.effects.length + r.sideEffects.length > 0 && (
              <div className={styles.tags}>
                {r.effects.map((e) => <Badge key={e} tone="accent">{labelFor(meta?.effects, e)}</Badge>)}
                {r.sideEffects.map((e) => <Badge key={e} tone="danger">{labelFor(meta?.sideEffects, e)}</Badge>)}
              </div>
            )}
            {r.notes && <p className={styles.notes}>{r.notes}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
