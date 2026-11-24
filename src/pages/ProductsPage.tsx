import { useState } from 'react';
import { productApi, type ProductQuery } from '../api/endpoints';
import { Button } from '../components/atoms/Button/Button';
import { Spinner } from '../components/atoms/Spinner/Spinner';
import { Alert } from '../components/molecules/Alert/Alert';
import { ProductCard } from '../components/organisms/ProductCard/ProductCard';
import { ProductFilters } from '../components/organisms/ProductFilters/ProductFilters';
import { useAsyncResource } from '../hooks/useAsyncResource';
import layout from '../styles/layout.module.css';
import styles from './ProductsPage.module.css';

export function ProductsPage() {
  const [query, setQuery] = useState<ProductQuery>({ sort: 'name', page: 1, perPage: 24 });
  const facets = useAsyncResource(() => productApi.facets(), []);
  const products = useAsyncResource(() => productApi.list(query), [JSON.stringify(query)]);
  const pagination = products.data?.pagination;

  return (
    <>
      <div className={layout.spread}>
        <h1>Cannabisblüten</h1>
        {pagination && <span className={layout.muted}>{pagination.total} Sorten</span>}
      </div>
      <ProductFilters query={query} facets={facets.data} onChange={setQuery} />
      {products.error && <Alert>{products.error}</Alert>}
      {products.loading && !products.data ? (
        <Spinner />
      ) : products.data?.items.length === 0 ? (
        <p className={layout.muted}>Keine Sorte passt zu den Filtern. Noch nichts da? Ein Admin startet den Abgleich unter „Verwaltung“.</p>
      ) : (
        <div className={styles.grid}>
          {products.data?.items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
      {pagination && pagination.pageCount > 1 && (
        <div className={styles.pager}>
          <Button variant="secondary" disabled={pagination.page <= 1}
            onClick={() => setQuery({ ...query, page: pagination.page - 1 })}>Zurück</Button>
          <span className={layout.muted}>Seite {pagination.page} von {pagination.pageCount}</span>
          <Button variant="secondary" disabled={pagination.page >= pagination.pageCount}
            onClick={() => setQuery({ ...query, page: pagination.page + 1 })}>Weiter</Button>
        </div>
      )}
    </>
  );
}
