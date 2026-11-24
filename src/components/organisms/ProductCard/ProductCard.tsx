import { Link } from 'react-router';
import type { Product } from '../../../api/types';
import { formatStars } from '../../../utils/format';
import { Badge } from '../../atoms/Badge/Badge';
import { StatBar } from '../../molecules/StatBar/StatBar';
import styles from './ProductCard.module.css';

/** Produktkachel im Stil der Shop-Übersicht, ergänzt um die Gruppenbewertung. */
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/sorten/${product.id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {product.available && <span className={styles.availability}>● lieferbar</span>}
        {product.thumbUrl ? (
          <img src={product.thumbUrl} alt="" loading="lazy" className={styles.image} />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">🌿</div>
        )}
      </div>
      <div className={styles.body}>
        <h2 className={styles.name}>{product.name}</h2>
        <p className={styles.meta}>{product.producer}</p>
        <p className={styles.meta}>{product.strain}</p>
        <div className={styles.badges}>
          {product.genetic && <Badge tone="primary">{product.dominance ? `${product.dominance} dominant` : product.genetic}</Badge>}
        </div>
        <p className={styles.rating}>
          <strong>{formatStars(product.rating.average)}</strong>
          {product.rating.count > 0 && <span> · {product.rating.count}×</span>}
        </p>
        <div className={styles.stats}>
          <StatBar label="THC" value={product.thc} />
          <StatBar label="CBD" value={product.cbd} max={20} tone="warm" />
        </div>
      </div>
    </Link>
  );
}
