import type { Rating } from '../../api/types';

export interface FeedDay {
  key: string;
  label: string;
  items: Rating[];
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const weekday = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' });
const time = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

/** „Heute“, „Gestern“ oder „Montag, 23.11.“ */
export function dayLabel(date: Date, now = new Date()): string {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dayKey(date) === dayKey(now)) return 'Heute';
  if (dayKey(date) === dayKey(yesterday)) return 'Gestern';
  return weekday.format(date).replace(/\.$/, '.');
}

/** „10:24 Uhr“ */
export const formatTime = (iso: string) => `${time.format(new Date(iso))} Uhr`;

/** Nachträglich geändert (mehr als eine Minute nach dem Anlegen) */
export const wasUpdated = (r: Rating) => new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime() > 60_000;

/** Einträge nach Tag der letzten Änderung gruppieren; die Reihenfolge kommt vom Server (neueste zuerst). */
export function groupByDay(items: Rating[], now = new Date()): FeedDay[] {
  const days: FeedDay[] = [];
  for (const item of items) {
    const date = new Date(item.updatedAt);
    const key = dayKey(date);
    const last = days[days.length - 1];
    if (last?.key === key) last.items.push(item);
    else days.push({ key, label: dayLabel(date, now), items: [item] });
  }
  return days;
}

const NEW_DAYS = 30;

/** „Neu“-Kennzeichnung: im Shop innerhalb der letzten 30 Tage erschienen */
export function isNew(releasedAt: string | null, now = new Date()): boolean {
  if (!releasedAt) return false;
  const age = now.getTime() - new Date(releasedAt).getTime();
  return age >= 0 && age < NEW_DAYS * 86_400_000;
}
