import type { Again, Rating, RatingInput, Visibility } from '../../api/types';
import type { IconName } from '../../components/atoms/Icon/Icon';

/** Formularzustand beim Bewerten. Nur `overall` ist Pflicht. */
export interface RatingDraft {
  overall: number | null;
  taste: number | null;
  aroma: number | null;
  effect: number | null;
  quality: number | null;
  effects: string[];
  sideEffects: string[];
  method: string | null;
  again: Again | null;
  consumedAt: string;
  notes: string;
  visibility: Visibility;
}

export const DETAIL_SCORES = [
  { key: 'taste', label: 'Geschmack' },
  { key: 'aroma', label: 'Aroma' },
  { key: 'effect', label: 'Wirkung' },
  { key: 'quality', label: 'Blütenqualität' },
] as const;

export const AGAIN_OPTIONS: { value: Again; label: string }[] = [
  { value: 'yes', label: 'Ja' },
  { value: 'maybe', label: 'Vielleicht' },
  { value: 'no', label: 'Nein' },
];

export const VISIBILITY_OPTIONS: { value: Visibility; label: string; icon: IconName }[] = [
  { value: 'private', label: 'Nur für mich', icon: 'lock' },
  { value: 'group', label: 'Mit der Runde teilen', icon: 'users' },
];

const METHOD_ICONS: Record<string, IconName> = {
  vaporizer: 'vaporizer',
  joint: 'joint',
  bong: 'bong',
  pfeife: 'pipe',
  edible: 'edible',
  sonstiges: 'dots',
};

export function methodIcon(key: string): IconName {
  return METHOD_ICONS[key] ?? 'dots';
}

export function toDraft(rating: Rating | null): RatingDraft {
  return {
    overall: rating?.overall ?? null,
    taste: rating?.taste ?? null,
    aroma: rating?.aroma ?? null,
    effect: rating?.effect ?? null,
    quality: rating?.quality ?? null,
    effects: rating?.effects ?? [],
    sideEffects: rating?.sideEffects ?? [],
    method: rating?.method ?? null,
    again: rating?.again ?? null,
    consumedAt: rating?.consumedAt ?? '',
    notes: rating?.notes ?? '',
    visibility: rating?.visibility ?? 'private',
  };
}

export function toInput(draft: RatingDraft, overall: number): RatingInput {
  return {
    overall,
    taste: draft.taste,
    aroma: draft.aroma,
    effect: draft.effect,
    quality: draft.quality,
    effects: draft.effects,
    side_effects: draft.sideEffects,
    method: draft.method,
    again: draft.again,
    consumed_at: draft.consumedAt || null,
    notes: draft.notes.trim() || null,
    visibility: draft.visibility,
  };
}

/** Gibt es Eingaben, die beim Schließen verloren gingen? Reihenfolge der Chips zählt nicht. */
export function isDirty(draft: RatingDraft, rating: Rating | null): boolean {
  const normal = (d: RatingDraft) =>
    JSON.stringify({ ...d, effects: [...d.effects].sort(), sideEffects: [...d.sideEffects].sort(), notes: d.notes.trim() });
  return normal(draft) !== normal(toDraft(rating));
}

/** Heutiges Datum in der Zeitzone des Geräts (für max im Datumsfeld). */
export function today(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
