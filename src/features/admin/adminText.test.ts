import { describe, expect, it } from 'vitest';
import type { Invite } from '../../api/types';
import { formatRunTime, inviteLink, inviteStatus, syncResult, triggerLabel } from './adminText';

const now = new Date(2026, 10, 26, 12, 0);
const invite = (patch: Partial<Invite>): Invite => ({
  id: 1, code: 'AB12CD34', role: 'member', note: 'Kathrin', expires_at: new Date(2026, 11, 10).toISOString(),
  used_at: null, used_by_name: null, revoked_at: null, created_at: now.toISOString(), ...patch,
});

describe('Verwaltung', () => {
  it('beschreibt den Status einer Einladung', () => {
    expect(inviteStatus(invite({}), now)).toEqual({ kind: 'open', label: 'Offen bis 10.12.' });
    expect(inviteStatus(invite({ used_at: now.toISOString(), used_by_name: 'Kathrin' }), now).label).toBe('Eingelöst von Kathrin');
    expect(inviteStatus(invite({ revoked_at: now.toISOString() }), now).kind).toBe('revoked');
    expect(inviteStatus(invite({ expires_at: new Date(2026, 10, 1).toISOString() }), now).kind).toBe('expired');
  });

  it('baut den echten Registrierungslink', () => {
    expect(inviteLink('AB12CD34', 'https://krautkompass.red-it.org', '/')).toBe('https://krautkompass.red-it.org/registrieren?code=AB12CD34');
  });

  it('beschreibt Abgleiche in Worten', () => {
    expect(syncResult({ listed: 119, created: 6, updated: 113, deactivated: 5, errors: [] })).toBe('119 gefunden · 6 neu · 113 aktualisiert · 5 entfernt');
    expect(syncResult({ listed: 119, created: 0, updated: 119 })).toBe('119 gefunden · 119 aktualisiert');
    expect(formatRunTime(new Date(2026, 10, 26, 9, 12).toISOString(), now)).toBe('Heute, 09:12 Uhr');
    expect(formatRunTime(new Date(2026, 10, 25, 2, 0).toISOString(), now)).toBe('Gestern, 02:00 Uhr');
    expect(formatRunTime(new Date(2026, 10, 24, 14, 21).toISOString(), now)).toBe('24.11.2026, 14:21 Uhr');
    expect(triggerLabel('cli')).toBe('automatisch');
    expect(triggerLabel('web')).toBe('manuell');
  });
});
