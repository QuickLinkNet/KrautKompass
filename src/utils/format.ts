// Formatierung für die Anzeige (deutsch)

const percent = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

const longDate = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const oneDigit = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function formatPercent(value: number | null): string {
  return value === null ? '–' : `${percent.format(value)} %`;
}

/**
 * THC/CBD wie im Shop: Der Shop speichert „unter 1 %“ als 1 und zeigt dann „< 1 %“.
 * Alle anderen Werte erscheinen mit einer Nachkommastelle.
 */
export function formatCannabinoid(value: number | null): string {
  if (value === null) return '–';
  return value === 1 ? '< 1,0 %' : formatPercent(value);
}

export function formatDate(iso: string | null): string {
  if (!iso) return '–';
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? '–' : date.format(parsed);
}

/** „08. Jan. 2025“ */
export function formatLongDate(iso: string | null): string {
  if (!iso) return '–';
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? '–' : longDate.format(parsed);
}

/** Preis pro Einheit; der Shop führt Blüten pro Gramm, daher „g“ als Rückfall. */
export function formatPrice(value: number | null, unit = 'g'): string | null {
  return value === null ? null : `${euro.format(value)} / ${unit}`;
}

/** Interne Skala 1–10 → „4,5“ (Sterne mit einer Nachkommastelle) */
export function formatStarValue(score: number): string {
  return oneDigit.format(score / 2);
}

/** „Anna Schmidt“ → „AS“ */
export function initials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '')).toUpperCase() || '?';
}

/** Interne Skala 1–10 → Sterne 0,5–5 */
export function toStars(score: number | null): number | null {
  return score === null ? null : Math.round(score) / 2;
}

export function formatStars(score: number | null): string {
  const stars = toStars(score);
  return stars === null ? 'noch keine Bewertung' : `${stars.toLocaleString('de-DE')} / 5`;
}
