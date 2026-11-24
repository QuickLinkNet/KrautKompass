import { Link, useLocation, useParams } from 'react-router';
import { productApi } from '../api/endpoints';
import { Badge } from '../components/atoms/Badge/Badge';
import { Card } from '../components/atoms/Card/Card';
import { Spinner } from '../components/atoms/Spinner/Spinner';
import { Alert } from '../components/molecules/Alert/Alert';
import { StatBar } from '../components/molecules/StatBar/StatBar';
import { RatingForm } from '../components/organisms/RatingForm/RatingForm';
import { RatingList } from '../components/organisms/RatingList/RatingList';
import { useMeta } from '../features/meta/useMeta';
import { useAsyncResource } from '../hooks/useAsyncResource';
import layout from '../styles/layout.module.css';
import { formatStars } from '../utils/format';
import styles from './ProductDetailPage.module.css';

export function ProductDetailPage() {
  const id = Number(useParams().id);
  // Zurück zum Katalog mit den Filtern, mit denen man gekommen ist
  const catalog = (useLocation().state as { catalog?: unknown } | null)?.catalog;
  const fromCatalog = typeof catalog === 'string' && catalog.startsWith('?') ? catalog : '';
  const meta = useMeta();
  const detail = useAsyncResource(() => productApi.show(id), [id]);

  if (detail.loading && !detail.data) return <Spinner />;
  if (detail.error || !detail.data) return <Alert>{detail.error ?? 'Sorte nicht gefunden.'}</Alert>;
  const { product, myRating, ratings } = detail.data;
  const others = ratings.filter((r) => !r.isMine);

  const facts: [string, string | null][] = [
    ['Hersteller', product.producer],
    ['Strain', product.strain],
    ['Genetik', product.dominance ? `${product.dominance} dominant (${product.genetic ?? ''})` : product.genetic],
    ['Herkunft', product.origin],
    ['Bestrahlung', product.irradiated === null ? null : product.irradiated ? 'bestrahlt' : 'unbestrahlt'],
  ];

  return (
    <div className={layout.stack}>
      <Link to={`/${fromCatalog}`} className={layout.muted}>← Alle Sorten</Link>
      <div className={styles.top}>
        <div className={styles.image}>
          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span aria-hidden="true">🌿</span>}
        </div>
        <div className={styles.info}>
          <h1>{product.name}</h1>
          <p className={styles.rating}>
            Runde: <strong>{formatStars(product.rating.average)}</strong>
            {product.rating.count > 0 && <> · {product.rating.count} geteilte Bewertung(en)</>}
          </p>
          <div className={layout.row}>
            <StatBar label="THC" value={product.thc} />
            <StatBar label="CBD" value={product.cbd} max={20} tone="warm" />
          </div>
          <dl className={styles.facts}>
            {facts.filter(([, v]) => v).map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          {product.terpenes.length > 0 && (
            <div className={layout.row}>{product.terpenes.map((t) => <Badge key={t} tone="accent">{t}</Badge>)}</div>
          )}
          {product.description && <p className={styles.description}>{product.description}</p>}
          <a href={product.shopUrl} target="_blank" rel="noreferrer" className={layout.muted}>Im Kraut-Kurier-Shop ansehen ↗</a>
        </div>
      </div>

      <Card>
        <h2>{myRating ? 'Deine Bewertung' : 'Jetzt bewerten'}</h2>
        {meta ? (
          <RatingForm key={myRating?.updatedAt ?? 'new'} productId={product.id} meta={meta} existing={myRating}
            onSaved={() => void detail.reload(true)} />
        ) : <Spinner />}
      </Card>

      <section>
        <h2>Bewertungen der Runde</h2>
        <RatingList ratings={others} empty="Noch niemand hat diese Sorte mit der Runde geteilt." />
      </section>
    </div>
  );
}
