import type { ProductDetails } from '../../../api/types';
import { formatPercent } from '../../../utils/format';
import { Badge } from '../../atoms/Badge/Badge';
import { Button } from '../../atoms/Button/Button';
import { Icon } from '../../atoms/Icon/Icon';
import { RatingStars } from '../../atoms/RatingStars/RatingStars';
import styles from './ProductHero.module.css';

interface ProductHeroProps {
  product: ProductDetails;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  /** Fehlt, wenn schon bewertet wurde – dann steht „Bewertung ändern“ an der eigenen Bewertung */
  onRate?: () => void;
}

/** Kopf der Sortenseite: Foto, Name, Bewertung der Runde, THC/CBD und Aktionen. */
export function ProductHero({ product, isFavorite, onToggleFavorite, onRate }: ProductHeroProps) {
  const { average, count } = product.rating;
  return (
    <section className={styles.hero}>
      <div className={styles.media}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className={styles.image} />
        ) : (
          <Icon name="leaf" size={24} className={styles.placeholder} label="Kein Foto vorhanden" />
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.head}>
          <h1 className={styles.name}>{product.name}</h1>
          {product.available ? (
            <Badge tone="success" icon="tick">Verfügbar</Badge>
          ) : (
            <Badge tone="danger" icon="x">Nicht verfügbar</Badge>
          )}
        </div>
        {product.producer && (
          <p className={styles.producer}>
            <Icon name="leaf" size={16} />
            {product.producer}
          </p>
        )}
        <p className={styles.rating}>
          <RatingStars value={average} size="lg" text="long" />
          {average !== null && <span className={styles.count}>{count} {count === 1 ? 'Bewertung' : 'Bewertungen'}</span>}
        </p>
        <p className={styles.metrics}>
          <span className={`${styles.metric} ${styles.thc}`}>THC <strong>{formatPercent(product.thc)}</strong></span>
          <span className={styles.metric}>CBD <strong>{formatPercent(product.cbd)}</strong></span>
        </p>
        <div className={styles.actions}>
          {onRate && <Button type="button" block className={styles.rate} onClick={onRate}>Jetzt bewerten</Button>}
          <Button type="button" block variant={isFavorite ? 'primary' : 'secondary'} icon="heart" aria-pressed={isFavorite}
            className={isFavorite ? styles.favored : undefined} onClick={onToggleFavorite}>
            {isFavorite ? 'Gemerkt' : 'Auf Merkliste'}
          </Button>
        </div>
      </div>
    </section>
  );
}
