import { useId } from 'react';
import type { Facets, Option } from '../../../api/types';
import { PRIMARY_EFFECTS, effectIcon, type CatalogFilters as Filters } from '../../../features/catalog/catalogQuery';
import { Choice } from '../../atoms/Choice/Choice';
import { Icon } from '../../atoms/Icon/Icon';
import { Select } from '../../atoms/Input/Input';
import { RangeField } from '../../molecules/RangeField/RangeField';
import { SearchField } from '../../molecules/SearchField/SearchField';
import styles from './CatalogFilters.module.css';

/** Mindestbewertung in Sternen (intern Skala 1–10 = Sterne × 2) */
const RATING_STEPS = [4.5, 4, 3.5, 3];

interface CatalogFiltersProps {
  filters: Filters;
  facets: Facets | null;
  effects: Option[];
  onChange: (patch: Partial<Filters>) => void;
  /** Suche im Panel zeigen (Desktop-Seitenleiste); mobil steht sie über der Liste */
  withSearch?: boolean;
}

/** Filter des Sortenkatalogs – Seitenleiste auf dem Desktop, Inhalt des Filter-Sheets mobil. */
export function CatalogFilters({ filters, facets, effects, onChange, withSearch = false }: CatalogFiltersProps) {
  // Seitenleiste und Filter-Sheet existieren gleichzeitig: IDs und Radio-Gruppen je Panel eindeutig
  const uid = useId();
  const thcMax = facets?.thcMax || 35;
  const cbdMax = facets?.cbdMax || 25;
  const primary = effects.filter((e) => PRIMARY_EFFECTS.includes(e.key));
  const more = effects.filter((e) => !PRIMARY_EFFECTS.includes(e.key));
  const selected = filters.effects ?? [];
  const toggleEffect = (key: string, on: boolean) =>
    onChange({ effects: on ? [...selected, key] : selected.filter((e) => e !== key) });
  const effectChoice = (e: Option) => (
    <Choice key={e.key} checked={selected.includes(e.key)} onChange={(ev) => toggleEffect(e.key, ev.target.checked)}>
      <Icon name={effectIcon(e.key)} size={16} className={styles.effectIcon} />
      {e.label}
    </Choice>
  );

  return (
    <div className={styles.panel}>
      {withSearch && (
        <div className={styles.section}>
          <SearchField id="catalog-search-side" value={filters.q ?? ''} onCommit={(q) => onChange({ q })} label="Suche" />
        </div>
      )}

      {/* Merkliste ganz oben: der häufigste Schnellfilter */}
      <div className={styles.section}>
        <Choice checked={!!filters.favorites} onChange={(e) => onChange({ favorites: e.target.checked })}>
          <span className={styles.favorite}><Icon name="heart" size={18} filled={!!filters.favorites} /> Nur meine Merkliste</span>
        </Choice>
      </div>

      <div className={styles.section}>
        <label className={styles.title} htmlFor={`${uid}-producer`}>Hersteller</label>
        <Select id={`${uid}-producer`} value={filters.producer ?? ''} onChange={(e) => onChange({ producer: e.target.value })}>
          <option value="">Alle Hersteller</option>
          {facets?.producers.map((p) => <option key={p}>{p}</option>)}
        </Select>
      </div>

      <div className={styles.section}>
        <RangeField label="THC-Gehalt" max={thcMax} value={{ min: filters.thcMin, max: filters.thcMax }}
          onChange={({ min, max }) => onChange({ thcMin: min, thcMax: max })} />
      </div>

      <div className={styles.section}>
        <RangeField label="CBD-Gehalt" max={cbdMax} value={{ min: filters.cbdMin, max: filters.cbdMax }}
          onChange={({ min, max }) => onChange({ cbdMin: min, cbdMax: max })} />
      </div>

      <div className={styles.section}>
        <label className={styles.title} htmlFor={`${uid}-terpene`}>Terpene</label>
        <Select id={`${uid}-terpene`} value={filters.terpene ?? ''} onChange={(e) => onChange({ terpene: e.target.value })}>
          <option value="">Terpen auswählen …</option>
          {facets?.terpenes.map((t) => <option key={t}>{t}</option>)}
        </Select>
      </div>

      <fieldset className={styles.section}>
        <legend className={styles.title}>Wirkung <span className={styles.hint}>laut Bewertungen</span></legend>
        <div className={styles.choices}>{primary.map(effectChoice)}</div>
        {more.length > 0 && (
          <details className={styles.more} open={more.some((e) => selected.includes(e.key))}>
            <summary>Weitere Wirkungen</summary>
            <div className={styles.choices}>{more.map(effectChoice)}</div>
          </details>
        )}
      </fieldset>

      <details className={styles.collapsible} open>
        <summary className={styles.title}>Bewertung <Icon name="chevronDown" size={18} /></summary>
        <div className={styles.choices} role="radiogroup" aria-label="Mindestbewertung">
          <Choice type="radio" name={`${uid}-rating`} checked={filters.minRating === undefined}
            onChange={() => onChange({ minRating: undefined })}>Alle</Choice>
          {RATING_STEPS.map((stars) => (
            <Choice key={stars} type="radio" name={`${uid}-rating`} checked={filters.minRating === stars * 2}
              onChange={() => onChange({ minRating: stars * 2 })}>
              <span className={styles.stars} aria-hidden="true">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Icon key={i} name="star" size={16} filled={i <= stars} />
                ))}
              </span>
              ab {stars.toLocaleString('de-DE')} Sterne
            </Choice>
          ))}
        </div>
      </details>

      <details className={styles.collapsible} open>
        <summary className={styles.title}>Verfügbarkeit <Icon name="chevronDown" size={18} /></summary>
        <div className={styles.choices}>
          <Choice checked={!!filters.available} onChange={(e) => onChange({ available: e.target.checked })}>
            Nur verfügbare Produkte
          </Choice>
        </div>
      </details>
    </div>
  );
}
