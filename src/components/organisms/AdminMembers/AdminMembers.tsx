import { useState } from 'react';
import { adminApi } from '../../../api/endpoints';
import type { User } from '../../../api/types';
import { useSession } from '../../../features/session/sessionContext';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import { errorMessage } from '../../../utils/errorMessage';
import { formatDate } from '../../../utils/format';
import { Avatar } from '../../atoms/Avatar/Avatar';
import { Badge } from '../../atoms/Badge/Badge';
import { Button } from '../../atoms/Button/Button';
import { ActionMenu } from '../../molecules/ActionMenu/ActionMenu';
import { Alert } from '../../molecules/Alert/Alert';
import { ConfirmDialog } from '../../molecules/ConfirmDialog/ConfirmDialog';
import { StateMessage } from '../../molecules/StateMessage/StateMessage';
import { JournalSkeleton } from '../JournalState/JournalState';
import styles from './AdminMembers.module.css';

type Change = { role?: User['role']; status?: User['status'] };

/** Bereich „Mitglieder“: Rolle ändern, sperren und entsperren (nicht beim eigenen Konto). */
export function AdminMembers({ users }: { users: ReturnType<typeof useAdminUsers> }) {
  const { user: me } = useSession();
  const [blocking, setBlocking] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const change = async (u: User, data: Change) => {
    setBusy(true);
    setError(null);
    try {
      await adminApi.updateUser(u.id, data);
      setBlocking(null);
      await users.reload(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (users.loading && !users.data) return <JournalSkeleton />;
  if (users.error) {
    return (
      <StateMessage icon="alert" tone="danger" title="Verwaltung konnte nicht geladen werden.">
        <Button iconEnd="refresh" onClick={() => void users.reload()}>Erneut versuchen</Button>
      </StateMessage>
    );
  }

  const list = users.data?.items ?? [];
  return (
    <section className={styles.section} aria-labelledby="admin-members">
      <h2 id="admin-members" className={styles.title}>Mitglieder ({list.length})</h2>
      {error && !blocking && <Alert>{error}</Alert>}
      <ul className={styles.list}>
        {list.map((u) => {
          const isMe = u.id === me?.id;
          const disabled = u.status === 'disabled';
          return (
            <li key={u.id} className={`${styles.row} ${disabled ? styles.disabled : ''}`}>
              <Avatar name={u.display_name} />
              <div className={styles.info}>
                <p className={styles.name}>
                  {u.display_name}{isMe && <span className={styles.me}> (Du)</span>}
                  {disabled && <Badge tone="danger">Gesperrt</Badge>}
                </p>
                <p className={styles.mail}>{u.email}</p>
                <p className={styles.meta}>
                  {u.role === 'admin' ? 'Admin' : 'Mitglied'} · Zuletzt aktiv {u.last_login_at ? formatDate(u.last_login_at) : 'noch nie'}
                </p>
              </div>
              {!isMe && (
                <ActionMenu label={`Aktionen für ${u.display_name}`} actions={[
                  u.role === 'admin'
                    ? { label: 'Admin-Rechte entziehen', onSelect: () => void change(u, { role: 'member' }) }
                    : { label: 'Zum Admin machen', onSelect: () => void change(u, { role: 'admin' }) },
                  disabled
                    ? { label: 'Entsperren', onSelect: () => void change(u, { status: 'active' }) }
                    : { label: 'Sperren', tone: 'danger', onSelect: () => setBlocking(u) },
                ]} />
              )}
            </li>
          );
        })}
      </ul>

      <ConfirmDialog open={blocking !== null} title={`${blocking?.display_name ?? ''} sperren?`} cancelLabel="Abbrechen"
        confirmLabel="Sperren" loading={busy} error={error}
        onCancel={() => { setBlocking(null); setError(null); }} onConfirm={() => blocking && void change(blocking, { status: 'disabled' })}>
        {blocking?.display_name ?? 'Das Mitglied'} kann sich dann nicht mehr anmelden.
      </ConfirmDialog>
    </section>
  );
}

/** Mitgliederliste; auf der Seite geladen, damit der Umschalter die Anzahl zeigen kann. */
export function useAdminUsers() {
  return useAsyncResource(() => adminApi.users(), []);
}
