import { describe, expect, it } from 'vitest';
import type { Rating } from '../../api/types';
import { activeFilterCount, applyFilters, DEFAULT_FILTERS, parseFilters, toParams } from './journalQuery';
import { summarize } from './journalSummary';

function rating(id: number, patch: Partial<Rating>): Rating {
  return {
    id, productId: id, productName: `Sorte ${id}`, productThumbUrl: null, author: { id: 1, name: 'MK' }, isMine: true,
    overall: 8, taste: null, aroma: null, effect: null, quality: null, again: null, effects: [], sideEffects: [],
    method: null, notes: null, visibility: 'private', consumedAt: null,
    createdAt: '2026-11-01T10:00:00Z', updatedAt: '2026-11-01T10:00:00Z', ...patch,
  };
}

const ratings = [
  rating(1, { productName: 'Platinum Garlic', overall: 9, effects: ['entspannend', 'schlaffoerdernd'], method: 'vaporizer', again: 'yes', consumedAt: '2026-11-12' }),
  rating(2, { productName: 'Orange Cake', overall: 9, effects: ['entspannend', 'kreativ'], method: 'vaporizer', visibility: 'group', consumedAt: '2026-11-06' }),
  rating(3, { productName: 'Frozen Lemon', overall: 5, effects: ['kreativ'], method: 'joint', again: 'no', consumedAt: '2026-10-01' }),
];

describe('Journal-Filter', () => {
  it('liest und schreibt die URL ohne Standardwerte', () => {
    const f = { ...DEFAULT_FILTERS, tab: 'merkliste' as const, minScore: 8, effects: ['entspannend'], again: 'yes' as const };
    expect(toParams(f).toString()).toBe('ansicht=merkliste&ab=8&wirkung=entspannend&wieder=yes');
    expect(parseFilters(toParams(f))).toEqual(f);
    expect(parseFilters(new URLSearchParams('ab=7&wieder=kaputt&sort=quatsch'))).toEqual(DEFAULT_FILTERS);
  });

  it('filtert nach Suche, Sternen, Wirkung (ODER), Form, „wieder“ und Sichtbarkeit', () => {
    const names = (f: Partial<typeof DEFAULT_FILTERS>) => applyFilters(ratings, { ...DEFAULT_FILTERS, ...f }).map((r) => r.productName);
    expect(names({ q: 'cake' })).toEqual(['Orange Cake']);
    expect(names({ minScore: 9 })).toEqual(['Platinum Garlic', 'Orange Cake']);
    expect(names({ effects: ['schlaffoerdernd', 'kreativ'] })).toEqual(['Platinum Garlic', 'Orange Cake', 'Frozen Lemon']);
    expect(names({ methods: ['joint'] })).toEqual(['Frozen Lemon']);
    expect(names({ again: 'no' })).toEqual(['Frozen Lemon']);
    expect(names({ visibility: 'group' })).toEqual(['Orange Cake']);
    expect(activeFilterCount({ ...DEFAULT_FILTERS, q: 'x', minScore: 6, methods: ['joint'] })).toBe(2);
  });

  it('sortiert nach Datum oder Bewertung', () => {
    const order = (sort: 'neu' | 'beste' | 'alt') => applyFilters(ratings, { ...DEFAULT_FILTERS, sort }).map((r) => r.id);
    expect(order('neu')).toEqual([1, 2, 3]);
    expect(order('alt')).toEqual([3, 2, 1]);
    expect(order('beste')).toEqual([1, 2, 3]);
  });
});

describe('Journal-Überblick', () => {
  it('zählt, mittelt und findet die häufigsten Angaben', () => {
    const s = summarize(ratings);
    expect(s.count).toBe(3);
    expect(s.average).toBeCloseTo(23 / 3);
    expect(s.again).toBe(1);
    expect(s.topEffects).toEqual(['entspannend', 'kreativ', 'schlaffoerdernd']);
    expect(s.topMethod).toBe('vaporizer');
    expect(s.top.map((r) => r.id)).toEqual([1, 2, 3]);
  });

  it('zeigt jede Sorte in den Top 3 nur einmal', () => {
    const again = rating(4, { productId: 1, productName: 'Platinum Garlic', overall: 7, consumedAt: '2026-11-20' });
    expect(summarize([...ratings, again]).top.map((r) => r.productId)).toEqual([1, 2, 3]);
  });

  it('ist ohne Bewertungen leer', () => {
    expect(summarize([])).toMatchObject({ count: 0, average: null, again: 0, topEffects: [], topMethod: null, top: [] });
  });
});
