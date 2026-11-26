import { useState } from 'react';
import { adminApi } from '../../../api/endpoints';
import type { Invite } from '../../../api/types';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import layout from '../../../styles/layout.module.css';
import { errorMessage } from '../../../utils/errorMessage';
import { formatDate } from '../../../utils/format';
import { Badge } from '../../atoms/Badge/Badge';
import { Button } from '../../atoms/Button/Button';
import { Card } from '../../atoms/Card/Card';
import { Input } from '../../atoms/Input/Input';
import { Alert } from '../../molecules/Alert/Alert';

function inviteState(i: Invite): { label: string; tone: 'success' | 'neutral' | 'danger' | 'primary' } {
  if (i.used_at) return { label: `eingelöst von ${i.used_by_name ?? '?'}`, tone: 'success' };
  if (i.revoked_at) return { label: 'widerrufen', tone: 'neutral' };
  if (new Date(i.expires_at) < new Date()) return { label: 'abgelaufen', tone: 'danger' };
  return { label: `offen bis ${formatDate(i.expires_at)}`, tone: 'primary' };
}

export function InvitePanel() {
  const invites = useAsyncResource(() => adminApi.invites(), []);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      await invites.reload(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const link = (code: string) => `${window.location.origin}${import.meta.env.BASE_URL}registrieren?code=${code}`;

  return (
    <Card className={layout.stack}>
      <h2>Einladungen</h2>
      <p className={layout.muted}>Registrieren kann sich nur, wer einen Code hat. Jeder Code gilt genau einmal.</p>
      {error && <Alert>{error}</Alert>}
      <div className={layout.row}>
        <Input placeholder="Für wen? (optional)" value={note} onChange={(e) => setNote(e.target.value)}
          style={{ maxWidth: 280 }} aria-label="Notiz zur Einladung" />
        <Button loading={busy} onClick={() => run(async () => { await adminApi.createInvite({ note: note || undefined }); setNote(''); })}>
          Einladung erstellen
        </Button>
      </div>
      <div className={layout.tableWrap}>
        <table className={layout.table}>
          <thead><tr><th>Code</th><th>Für</th><th>Status</th><th /></tr></thead>
          <tbody>
            {invites.data?.items.map((i) => {
              const state = inviteState(i);
              const open = state.tone === 'primary';
              return (
                <tr key={i.id}>
                  <td className={layout.code}>{i.code}</td>
                  <td>{i.note ?? '–'}</td>
                  <td><Badge tone={state.tone}>{state.label}</Badge></td>
                  <td className={layout.row}>
                    {open && <Button size="sm" variant="secondary" onClick={() => void navigator.clipboard.writeText(link(i.code))}>Link kopieren</Button>}
                    {open && <Button size="sm" variant="ghost" onClick={() => run(() => adminApi.revokeInvite(i.id))}>Widerrufen</Button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
