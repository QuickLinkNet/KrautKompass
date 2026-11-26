import { Link } from 'react-router';
import type { Product } from '../../../api/types';
import { formatCannabinoid } from '../../../utils/format';
import { Icon } from '../../atoms/Icon/Icon';
import styles from './ProductMiniCard.module.css';

/** Kleine Sortenkarte für waagerechte Reihen („Neu im Katalog“). Die ganze Karte ist der Link. */
export function ProductMiniCard({ product, isNew }: { product: Product; isNew: boolean }) {
  return (
    <article className={styles.card}>
      {isNew && <span className={styles.badge}>Neu</span>}
      <span className={styles.media}>
        {product.thumbUrl ? <img src={product.thumbUrl} alt="" loading="lazy" decoding="async" /> : <Icon name="leaf" size={24} />}
      </span>
      <h3 className={styles.name}><Link to={`/sorten/${product.id}`} className={styles.link}>{product.name}</Link></h3>
      {product.producer && <p className={styles.producer}>{product.producer}</p>}
      <p className={styles.metrics}>
        <span>THC {formatCannabinoid(product.thc)}</span>
        <span>CBD {formatCannabinoid(product.cbd)}</span>
      </p>
    </article>
  );
}
