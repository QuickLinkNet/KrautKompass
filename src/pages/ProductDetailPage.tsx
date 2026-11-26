import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import type { Rating } from '../api/types';
import { Badge } from '../components/atoms/Badge/Badge';
import { Button } from '../components/atoms/Button/Button';
import { Icon } from '../components/atoms/Icon/Icon';
import { Skeleton } from '../components/atoms/Skeleton/Skeleton';
import { Alert } from '../components/molecules/Alert/Alert';
import { GroupReport } from '../components/organisms/GroupReport/GroupReport';
import { MyRatings } from '../components/organisms/MyRatings/MyRatings';
import { ProductFacts } from '../components/organisms/ProductFacts/ProductFacts';
import { ProductHero } from '../components/organisms/ProductHero/ProductHero';
import { RatingDialog } from '../components/organisms/RatingDialog/RatingDialog';
import { RoundRatings } from '../components/organisms/RoundRatings/RoundRatings';
import { labelFor, useMeta } from '../features/meta/useMeta';
import { useProductDetail } from '../features/products/useProductDetail';
import { useRatingRoute } from '../features/rating/useRatingRoute';
import layout from '../styles/layout.module.css';
import styles from './ProductDetailPage.module.css';

export function ProductDetailPage() {
  const id = Number(useParams().id);
  // Zurück zum Katalog mit den Filtern, mit denen man gekommen ist
  const state = useLocation().state as { catalog?: unknown; ratingId?: unknown } | null;
  const catalog = state?.catalog;
  const fromCatalog = typeof catalog === 'string' && catalog.startsWith('?') ? catalog : '';
  const meta = useMeta();
  const detail = useProductDetail(id);
  const rating = useRatingRoute();
  // Welche eigene Bewertung der Dialog bearbeitet; null = neue Bewertung. Aus dem Journal kommt die ID im Verlaufseintrag.
  const [editId, setEditId] = useState<number | null>(typeof state?.ratingId === 'number' ? state.ratingId : null);

  const back = (
    <Link to={`/${fromCatalog}`} className={`${layout.backLink} ${styles.back}`}>
      <Icon name="arrowLeft" size={18} />
      Alle Sorten
    </Link>
  );

  if (!detail.data) {
    return (
      <div className={styles.page}>
        {back}
        {detail.loading ? <DetailSkeleton /> : <DetailError message={detail.error} onRetry={() => void detail.reload()} />}
      </div>
    );
  }

  const { product, summary, myRatings, ratings } = detail.data;
  const editing = myRatings.find((r) => r.id === editId) ?? null;
  const rateLabel = myRatings.length > 0 ? 'Neue Bewertung' : 'Jetzt bewerten';
  const startNew = () => {
    setEditId(null);
    rating.start();
  };
  const startEdit = (r: Rating) => {
    setEditId(r.id);
    rating.start();
  };
  const effectLabel = (key: string) => labelFor(meta?.effects, key);

  return (
    <div className={styles.page}>
      {back}
      {detail.favoriteError && <Alert>{detail.favoriteError}</Alert>}
      <ProductHero product={product} isFavorite={detail.isFavorite} onToggleFavorite={() => void detail.toggleFavorite()}
        onRate={startNew} rateLabel={rateLabel} />

      <div className={styles.columns}>
        <div className={styles.column}>
          {myRatings.length > 0 && <MyRatings ratings={myRatings} onEdit={startEdit} onNew={startNew} />}
          {product.terpenes.length > 0 && (
            <section>
              <h2>Terpene</h2>
              <div className={styles.terpenes}>
                {product.terpenes.map((t) => <Badge key={t} tone="effect">{t}</Badge>)}
              </div>
            </section>
          )}
          <GroupReport summary={summary} effectLabel={effectLabel} />
        </div>
        <div className={styles.column}>
          <ProductFacts product={product} />
        </div>
      </div>

      <RoundRatings ratings={ratings.filter((r) => r.visibility === 'group')} meta={meta} />

      <div className={styles.cta}>
        <Button type="button" block onClick={startNew}>{rateLabel}</Button>
      </div>

      {meta && (
        <RatingDialog open={rating.open} product={product} meta={meta} existing={editing} onClose={rating.close}
          onChanged={() => void detail.reload(true)} mayClose={rating.mayClose} />
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className={styles.skeleton} role="status" aria-label="Sorte wird geladen">
      <Skeleton className={styles.skeletonMedia} />
      <div className={styles.skeletonLines}>
        <Skeleton className={styles.skeletonTitle} />
        <Skeleton />
        <Skeleton />
        <Skeleton className={styles.skeletonShort} />
      </div>
    </div>
  );
}

function DetailError({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <div className={styles.error} role="alert">
      <Icon name="alert" size={24} />
      <p className={styles.errorTitle}>Sorte konnte nicht geladen werden</p>
      {message && <p className={styles.errorText}>{message}</p>}
      <Button type="button" onClick={onRetry}>Erneut versuchen</Button>
    </div>
  );
}
