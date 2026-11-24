import type { ProductQuery, ProductSort } from '../../api/endpoints';
import type { IconName } from '../../components/atoms/Icon/Icon';

/** Filter des Sortenkatalogs (ohne Seite) – Quelle der Wahrheit ist die URL. */
export type CatalogFilters = Omit<ProductQuery, 'page' | 'perPage'>;

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'popular', label: 'Beliebtheit' },
  { value: 'rating', label: 'Beste Bewertung' },
  { value: 'thc', label: 'Höchster THC-Gehalt' },
  { value: 'thc_asc', label: 'Niedrigster THC-Gehalt' },
  { value: 'newest', label: 'Neueste' },
];
export const DEFAULT_SORT: ProductSort = 'popular';

/** Wirkungen, die im Filter direkt sichtbar sind (Screendesign), der Rest klappt auf. */
export const PRIMARY_EFFECTS = ['entspannend', 'fokussiert', 'schlaffoerdernd', 'kreativ'];

const EFFECT_ICONS: Record<string, IconName> = {
  entspannend: 'leaf',
  beruhigend: 'leaf',
  fokussiert: 'target',
  schlaffoerdernd: 'moon',
  kreativ: 'sparkle',
  euphorisch: 'sparkle',
};

export function effectIcon(key: string): IconName {
  return EFFECT_ICONS[key] ?? 'leaf';
}

const NUMBER_KEYS = ['thcMin', 'thcMax', 'cbdMin', 'cbdMax', 'minRating'] as const;
const TEXT_KEYS = ['q', 'producer', 'terpene'] as const;

export function parseFilters(params: URLSearchParams): CatalogFilters {
  const filters: CatalogFilters = {};
  for (const key of TEXT_KEYS) {
    const value = params.get(key)?.trim();
    if (value) filters[key] = value;
  }
  for (const key of NUMBER_KEYS) {
    const raw = params.get(key);
    const value = raw === null || raw === '' ? NaN : Number(raw);
    if (Number.isFinite(value) && value >= 0) filters[key] = value;
  }
  const effects = params.get('effects')?.split(',').filter(Boolean);
  if (effects?.length) filters.effects = effects;
  if (params.get('available') === '1') filters.available = true;
  if (params.get('favorites') === '1') filters.favorites = true;
  const sort = params.get('sort');
  if (sort && SORT_OPTIONS.some((o) => o.value === sort) && sort !== DEFAULT_SORT) filters.sort = sort as ProductSort;
  return filters;
}

export function toSearchParams(filters: CatalogFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of TEXT_KEYS) if (filters[key]) params.set(key, filters[key]);
  for (const key of NUMBER_KEYS) if (filters[key] !== undefined) params.set(key, String(filters[key]));
  if (filters.effects?.length) params.set('effects', filters.effects.join(','));
  if (filters.available) params.set('available', '1');
  if (filters.favorites) params.set('favorites', '1');
  if (filters.sort && filters.sort !== DEFAULT_SORT) params.set('sort', filters.sort);
  return params;
}

/** Entfernt leere Werte, damit die URL sauber bleibt. */
export function patchFilters(filters: CatalogFilters, patch: Partial<CatalogFilters>): CatalogFilters {
  const next: Record<string, unknown> = { ...filters, ...patch };
  for (const [key, value] of Object.entries(next)) {
    if (value === undefined || value === '' || value === false || (Array.isArray(value) && value.length === 0)) {
      delete next[key];
    }
  }
  return next as CatalogFilters;
}

export interface FilterChip {
  key: string;
  label: string;
  icon?: IconName;
  patch: Partial<CatalogFilters>;
}

const number = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });

function rangeLabel(name: string, min: number | undefined, max: number | undefined, upper: number): string {
  return `${name}: ${number.format(min ?? 0)} – ${number.format(max ?? upper)} %`;
}

/**
 * Aktive Filter als entfernbare Chips (ohne Suche und Sortierung).
 * @param effectLabel Anzeigename einer Wirkung (aus /api/meta)
 */
export function filterChips(
  filters: CatalogFilters,
  limits: { thcMax: number; cbdMax: number },
  effectLabel: (key: string) => string,
): FilterChip[] {
  const chips: FilterChip[] = [];
  if (filters.producer) chips.push({ key: 'producer', label: filters.producer, patch: { producer: undefined } });
  if (filters.thcMin !== undefined || filters.thcMax !== undefined) {
    chips.push({
      key: 'thc',
      label: rangeLabel('THC', filters.thcMin, filters.thcMax, limits.thcMax),
      patch: { thcMin: undefined, thcMax: undefined },
    });
  }
  if (filters.cbdMin !== undefined || filters.cbdMax !== undefined) {
    chips.push({
      key: 'cbd',
      label: rangeLabel('CBD', filters.cbdMin, filters.cbdMax, limits.cbdMax),
      patch: { cbdMin: undefined, cbdMax: undefined },
    });
  }
  if (filters.terpene) chips.push({ key: 'terpene', label: filters.terpene, patch: { terpene: undefined } });
  for (const effect of filters.effects ?? []) {
    chips.push({
      key: `effect-${effect}`,
      label: effectLabel(effect),
      icon: effectIcon(effect),
      patch: { effects: filters.effects?.filter((e) => e !== effect) },
    });
  }
  if (filters.minRating !== undefined) {
    chips.push({ key: 'rating', label: `ab ${number.format(filters.minRating / 2)} Sterne`, icon: 'star', patch: { minRating: undefined } });
  }
  if (filters.available) chips.push({ key: 'available', label: 'Verfügbar', patch: { available: undefined } });
  if (filters.favorites) chips.push({ key: 'favorites', label: 'Merkliste', icon: 'heart', patch: { favorites: undefined } });
  return chips;
}
