// Formatierung für die Anzeige (deutsch)

const percent = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function formatPercent(value: number | null): string {
  return value === null ? '–' : `${percent.format(value)} %`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return '–';
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? '–' : date.format(parsed);
}

/** Interne Skala 1–10 → Sterne 0,5–5 */
export function toStars(score: number | null): number | null {
  return score === null ? null : Math.round(score) / 2;
}

export function formatStars(score: number | null): string {
  const stars = toStars(score);
  return stars === null ? 'noch keine Bewertung' : `${stars.toLocaleString('de-DE')} / 5`;
}
