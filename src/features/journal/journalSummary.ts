import type { Rating } from '../../api/types';

export interface JournalSummary {
  count: number;
  /** Durchschnitt auf der Skala 1–10, null ohne Bewertungen */
  average: number | null;
  /** „würdest du wieder nehmen“ (nur „Ja“) */
  again: number;
  /** Häufigste Wirkungen, höchstens drei */
  topEffects: string[];
  /** Häufigste Konsumform oder null */
  topMethod: string | null;
  /** Beste drei Sorten (je Sorte die beste eigene Bewertung, bei Gleichstand die neuere) */
  top: Rating[];
}

function ranked(values: string[]): string[] {
  const counts = new Map<string, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  // Gleichstand: zuerst Genanntes gewinnt (Map behält die Reihenfolge)
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([key]) => key);
}

/** Überblick „Dein Kompass“ aus den eigenen Bewertungen. */
export function summarize(ratings: Rating[]): JournalSummary {
  const count = ratings.length;
  const newest = [...ratings].sort((a, b) => (b.consumedAt ?? b.updatedAt).localeCompare(a.consumedAt ?? a.updatedAt));
  return {
    count,
    average: count ? ratings.reduce((sum, r) => sum + r.overall, 0) / count : null,
    again: ratings.filter((r) => r.again === 'yes').length,
    topEffects: ranked(newest.flatMap((r) => r.effects)).slice(0, 3),
    topMethod: ranked(newest.flatMap((r) => (r.method ? [r.method] : [])))[0] ?? null,
    top: [...newest].sort((a, b) => b.overall - a.overall)
      .filter((r, i, all) => all.findIndex((x) => x.productId === r.productId) === i)
      .slice(0, 3),
  };
}
