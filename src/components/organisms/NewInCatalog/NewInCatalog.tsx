import { Link } from 'react-router';
import { productApi } from '../../../api/endpoints';
import { isNew } from '../../../features/feed/feedGroups';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import { Icon } from '../../atoms/Icon/Icon';
import { Skeleton } from '../../atoms/Skeleton/Skeleton';
import { ProductMiniCard } from '../../molecules/ProductMiniCard/ProductMiniCard';
import styles from './NewInCatalog.module.css';

/** „Neu im Katalog“: die zuletzt im Shop erschienenen Sorten als wischbare Reihe. */
export function NewInCatalog() {
  const latest = useAsyncResource(() => productApi.list({ sort: 'newest', perPage: 8, available: true }), []);
  const items = latest.data?.items ?? [];
  if (!latest.loading && items.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="new-in-catalog">
      <div className={styles.head}>
        <h2 id="new-in-catalog" className={styles.title}>Neu im Katalog</h2>
        <Link to="/?sort=newest" className={styles.all}>
          Alle<span className={styles.wide}> im Katalog</span> ansehen <Icon name="arrowRight" size={16} />
        </Link>
      </div>
      <ul className={styles.row}>
        {latest.loading
          ? [0, 1, 2].map((i) => <li key={i}><Skeleton className={styles.skeleton} /></li>)
          : items.map((p) => <li key={p.id}><ProductMiniCard product={p} isNew={isNew(p.releasedAt)} /></li>)}
      </ul>
    </section>
  );
}
