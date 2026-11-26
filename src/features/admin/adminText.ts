import type { Invite, SyncRun } from '../../api/types';

export type InviteKind = 'open' | 'used' | 'expired' | 'revoked';

const shortDate = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' });
const longDate = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const time = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

/** Status einer Einladung wie im Entwurf: „Offen bis 10.12.“, „Eingelöst von Kathrin“ … */
export function inviteStatus(i: Invite, now = new Date()): { kind: InviteKind; label: string } {
  if (i.used_at) return { kind: 'used', label: `Eingelöst von ${i.used_by_name ?? 'jemandem'}` };
  if (i.revoked_at) return { kind: 'revoked', label: 'Widerrufen' };
  if (new Date(i.expires_at) < now) return { kind: 'expired', label: 'Abgelaufen' };
  return { kind: 'open', label: `Offen bis ${shortDate.format(new Date(i.expires_at))}` };
}

/** Registrierungslink mit Code (berücksichtigt einen Unterordner) */
export function inviteLink(code: string, origin = window.location.origin, base = import.meta.env.BASE_URL): string {
  return `${origin}${base}registrieren?code=${encodeURIComponent(code)}`;
}

export const formatValidUntil = (iso: string) => `Gültig bis ${longDate.format(new Date(iso))} · nur einmal nutzbar`;

/** „Heute, 09:12 Uhr“, „Gestern, 02:00 Uhr“ oder „24.11.2026, 14:21 Uhr“ */
export function formatRunTime(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const day = same(date, now) ? 'Heute' : same(date, yesterday) ? 'Gestern' : longDate.format(date);
  return `${day}, ${time.format(date)} Uhr`;
}

const num = (v: number | string[] | undefined) => (typeof v === 'number' ? v : 0);

/** Ergebnis eines Abgleichs in Worten: „119 gefunden · 6 neu · 113 aktualisiert · 5 entfernt“ */
export function syncResult(stats: SyncRun['stats']): string {
  const parts = [`${num(stats.listed)} gefunden`];
  if (num(stats.created)) parts.push(`${num(stats.created)} neu`);
  if (num(stats.updated)) parts.push(`${num(stats.updated)} aktualisiert`);
  if (num(stats.deactivated)) parts.push(`${num(stats.deactivated)} entfernt`);
  return parts.join(' · ');
}

export const triggerLabel = (trigger: string) => (trigger === 'cli' ? 'automatisch' : 'manuell');
