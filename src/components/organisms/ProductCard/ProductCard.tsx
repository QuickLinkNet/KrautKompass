import { Link, useLocation } from 'react-router';
import type { Product } from '../../../api/types';
import { effectIcon } from '../../../features/catalog/catalogQuery';
import { formatPercent } from '../../../utils/format';
import { Badge } from '../../atoms/Badge/Badge';
import { Icon } from '../../atoms/Icon/Icon';
import { IconButton } from '../../atoms/IconButton/IconButton';
import { RatingStars } from '../../atoms/RatingStars/RatingStars';
import styles from './ProductCard.module.css';

export type CardView = 'list' | 'grid';

interface ProductCardProps {
  product: Product;
  view?: CardView;
  effectLabel: (key: string) => string;
  onToggleFavorite: (product: Product) => void;
}

/**
 * Produktkarte des Sortenkatalogs (Screendesign „Produktkarte“). Der Name ist der Link,
 * seine Fläche deckt die ganze Karte ab; Merken-Button und Pfeil liegen darüber.
 */
export function ProductCard({ product, view = 'list', effectLabel, onToggleFavorite }: ProductCardProps) {
  const href = `/sorten/${product.id}`;
  const { search } = useLocation();
  const effects = product.topEffects ?? [];
  return (
    <article className={`${styles.card} ${styles[view]}`}>
      <div className={styles.media}>
        {product.thumbUrl ? (
          <img src={product.thumbUrl} alt="" loading="lazy" decoding="async" className={styles.image} />
        ) : (
          <Icon name="leaf" size={24} className={styles.placeholder} />
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.head}>
          <h2 className={styles.name}>
            <Link to={href} state={{ catalog: search }} className={styles.link}>{product.name}</Link>
          </h2>
          <div className={styles.rating}>
            <RatingStars value={product.rating.average} count={product.rating.average === null ? undefined : product.rating.count} />
          </div>
        </div>
        {product.producer && (
          <p className={styles.producer}>
            <Icon name="leaf" size={14} />
            {product.producer}
          </p>
        )}
        <div className={`${styles.tags} ${styles.metrics}`}>
          <Badge tone="metric">THC {formatPercent(product.thc)}</Badge>
          <Badge tone="metric">CBD {formatPercent(product.cbd)}</Badge>
          {!product.available && <span className={styles.unavailable}>derzeit nicht lieferbar</span>}
        </div>
        {product.terpenes.length > 0 && (
          <div className={`${styles.tags} ${styles.terpenes}`}>
            {product.terpenes.slice(0, 3).map((t) => <Badge key={t} tone="plain">{t}</Badge>)}
          </div>
        )}
        {effects.length > 0 && (
          <div className={`${styles.tags} ${styles.effects}`}>
            {effects.map((e) => <Badge key={e} tone="effect" icon={effectIcon(e)}>{effectLabel(e)}</Badge>)}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <IconButton
          icon="heart"
          filled={product.favorite}
          aria-pressed={product.favorite}
          label={product.favorite ? `${product.name} von der Merkliste nehmen` : `${product.name} auf die Merkliste`}
          onClick={() => onToggleFavorite(product)}
          className={`${styles.favorite} ${product.favorite ? styles.favored : ''}`}
        />
        <span className={styles.details} aria-hidden="true">
          <span className={styles.detailsText}>Details ansehen</span>
          <Icon name="arrowRight" size={18} />
        </span>
      </div>
    </article>
  );
}
