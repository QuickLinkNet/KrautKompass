import type { Again, Rating, Visibility } from '../../api/types';

export type JournalTab = 'bewertungen' | 'merkliste';
export type JournalSort = 'neu' | 'beste' | 'alt';

export interface JournalFilters {
  tab: JournalTab;
  q: string;
  sort: JournalSort;
  /** Mindestwert auf der Skala 1–10 (6 = ab 3 Sterne), null = alle */
  minScore: number | null;
  effects: string[];
  methods: string[];
  again: Again | null;
  visibility: Visibility | null;
}

export const DEFAULT_FILTERS: JournalFilters = {
  tab: 'bewertungen', q: '', sort: 'neu', minScore: null, effects: [], methods: [], again: null, visibility: null,
};

/** „ab Sterne“-Stufen wie im Entwurf: Alle, 3+, 4+, 4,5+, 5 */
export const STAR_STEPS = [
  { score: null, label: 'Alle' },
  { score: 6, label: '3+' },
  { score: 8, label: '4+' },
  { score: 9, label: '4,5+' },
  { score: 10, label: '5' },
] as const;

const AGAIN: Again[] = ['yes', 'maybe', 'no'];
const VISIBILITY: Visibility[] = ['private', 'group'];
const SORTS: JournalSort[] = ['neu', 'beste', 'alt'];

const list = (value: string | null) => (value ? value.split(',').filter(Boolean) : []);

/** Filter stehen in der URL: teilbar, Zurück-Taste und Neuladen behalten sie. */
export function parseFilters(params: URLSearchParams): JournalFilters {
  const score = Number(params.get('ab'));
  const again = params.get('wieder') as Again | null;
  const visibility = params.get('sichtbar') as Visibility | null;
  const sort = params.get('sort') as JournalSort | null;
  return {
    tab: params.get('ansicht') === 'merkliste' ? 'merkliste' : 'bewertungen',
    q: params.get('q') ?? '',
    sort: sort && SORTS.includes(sort) ? sort : 'neu',
    minScore: STAR_STEPS.some((s) => s.score === score) ? score : null,
    effects: list(params.get('wirkung')),
    methods: list(params.get('form')),
    again: again && AGAIN.includes(again) ? again : null,
    visibility: visibility && VISIBILITY.includes(visibility) ? visibility : null,
  };
}

export function toParams(f: JournalFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.tab === 'merkliste') p.set('ansicht', 'merkliste');
  if (f.q.trim()) p.set('q', f.q.trim());
  if (f.sort !== 'neu') p.set('sort', f.sort);
  if (f.minScore !== null) p.set('ab', String(f.minScore));
  if (f.effects.length) p.set('wirkung', f.effects.join(','));
  if (f.methods.length) p.set('form', f.methods.join(','));
  if (f.again) p.set('wieder', f.again);
  if (f.visibility) p.set('sichtbar', f.visibility);
  return p;
}

/** Anzahl gesetzter Filter (ohne Suche und Sortierung) für „Filter (3)“ */
export function activeFilterCount(f: JournalFilters): number {
  return [f.minScore !== null, f.effects.length > 0, f.methods.length > 0, f.again !== null, f.visibility !== null]
    .filter(Boolean).length;
}

export function clearFilters(f: JournalFilters): JournalFilters {
  return { ...DEFAULT_FILTERS, tab: f.tab, q: f.q, sort: f.sort };
}

const dateOf = (r: Rating) => r.consumedAt ?? r.updatedAt;

/** Eigene Bewertungen filtern und sortieren (alles im Browser, die Liste ist klein). */
export function applyFilters(ratings: Rating[], f: JournalFilters): Rating[] {
  const q = f.q.trim().toLocaleLowerCase('de');
  const result = ratings.filter((r) =>
    (!q || (r.productName ?? '').toLocaleLowerCase('de').includes(q))
    && (f.minScore === null || r.overall >= f.minScore)
    && (f.effects.length === 0 || f.effects.some((e) => r.effects.includes(e)))
    && (f.methods.length === 0 || (r.method !== null && f.methods.includes(r.method)))
    && (f.again === null || r.again === f.again)
    && (f.visibility === null || r.visibility === f.visibility));
  const byDate = (a: Rating, b: Rating) => dateOf(b).localeCompare(dateOf(a));
  if (f.sort === 'beste') return result.sort((a, b) => b.overall - a.overall || byDate(a, b));
  if (f.sort === 'alt') return result.sort((a, b) => -byDate(a, b));
  return result.sort(byDate);
}
