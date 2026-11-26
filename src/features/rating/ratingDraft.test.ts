import { describe, expect, it } from 'vitest';
import type { Rating } from '../../api/types';
import { isDirty, toDraft, toInput, today } from './ratingDraft';

const rating: Rating = {
  id: 1, productId: 2, productName: null, productThumbUrl: null, author: { id: 1, name: 'A' }, isMine: true,
  overall: 9, taste: 8, aroma: null, effect: null, quality: 7, again: 'yes',
  effects: ['entspannend', 'gluecklich'], sideEffects: [], method: 'joint', notes: 'Gut', visibility: 'group',
  consumedAt: '2026-11-20', createdAt: '', updatedAt: '',
};

describe('ratingDraft', () => {
  it('startet leer und privat', () => {
    expect(toDraft(null)).toMatchObject({ overall: null, effects: [], again: null, visibility: 'private' });
  });

  it('übernimmt eine Bewertung unverändert hin und zurück', () => {
    expect(toInput(toDraft(rating), 9)).toEqual({
      overall: 9, taste: 8, aroma: null, effect: null, quality: 7, effects: ['entspannend', 'gluecklich'],
      side_effects: [], method: 'joint', again: 'yes', consumed_at: '2026-11-20', notes: 'Gut', visibility: 'group',
    });
  });

  it('sendet leere Angaben als null', () => {
    const input = toInput({ ...toDraft(null), notes: '   ' }, 5);
    expect([input.notes, input.consumed_at, input.method, input.quality]).toEqual([null, null, null, null]);
  });

  it('erkennt Änderungen, ignoriert aber die Reihenfolge der Chips', () => {
    expect(isDirty(toDraft(null), null)).toBe(false);
    expect(isDirty({ ...toDraft(rating), effects: ['gluecklich', 'entspannend'] }, rating)).toBe(false);
    expect(isDirty({ ...toDraft(rating), overall: 8 }, rating)).toBe(true);
    expect(isDirty({ ...toDraft(null), effects: ['kreativ'] }, null)).toBe(true);
  });

  it('liefert das lokale Datum', () => {
    expect(today(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });
});
