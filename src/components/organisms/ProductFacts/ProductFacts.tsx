import { useState } from 'react';
import type { ProductDetails } from '../../../api/types';
import { formatPrice } from '../../../utils/format';
import { Card } from '../../atoms/Card/Card';
import { Icon } from '../../atoms/Icon/Icon';
import styles from './ProductFacts.module.css';

const LONG_TEXT = 260;

function facts(p: ProductDetails): [string, string | null][] {
  return [
    ['Hersteller', p.producer],
    ['Strain', p.strain],
    ['Genetik', p.dominance ? `${p.genetic ?? ''} (${p.dominance}-dominant)`.trim() : p.genetic],
    ['Herkunft', p.origin],
    ['Bestrahlung', p.irradiated === null ? null : p.irradiated ? 'Ja' : 'Nein'],
    ['Preis laut Shop', formatPrice(p.price)],
  ];
}

/** Steckbrief, Beschreibung und Link in den Shop. Leere Angaben werden ausgelassen. */
export function ProductFacts({ product }: { product: ProductDetails }) {
  const [expanded, setExpanded] = useState(false);
  const text = product.description ?? '';
  const isLong = text.length > LONG_TEXT;
  return (
    <>
      <Card>
        <h2>Steckbrief</h2>
        <dl className={styles.facts}>
          {facts(product).filter(([, value]) => value).map(([label, value]) => (
            <div key={label} className={styles.fact}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
      {text && (
        <section>
          <h2>Beschreibung</h2>
          <p className={`${styles.description} ${isLong && !expanded ? styles.clamped : ''}`}>{text}</p>
          {isLong && (
            <button type="button" className={styles.more} aria-expanded={expanded} onClick={() => setExpanded((v) => !v)}>
              {expanded ? 'Weniger anzeigen' : 'Mehr lesen'}
            </button>
          )}
        </section>
      )}
      <a href={product.shopUrl} target="_blank" rel="noreferrer" className={styles.shop}>
        Im Kraut-Kurier-Shop ansehen
        <Icon name="externalLink" size={18} />
        <span className={styles.srOnly}>(öffnet in neuem Tab)</span>
      </a>
    </>
  );
}
