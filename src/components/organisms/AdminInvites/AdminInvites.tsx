import { useState } from 'react';
import { adminApi } from '../../../api/endpoints';
import type { Invite } from '../../../api/types';
import { useShareLink } from '../../../features/admin/useShareLink';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import { errorMessage } from '../../../utils/errorMessage';
import { Button } from '../../atoms/Button/Button';
import { ConfirmDialog } from '../../molecules/ConfirmDialog/ConfirmDialog';
import { StateMessage } from '../../molecules/StateMessage/StateMessage';
import { Toast } from '../../molecules/Toast/Toast';
import { JournalSkeleton } from '../JournalState/JournalState';
import { InviteForm } from './InviteForm';
import { InviteList } from './InviteList';
import { InviteReady } from './InviteReady';
import styles from './AdminInvites.module.css';

/** Bereich „Einladungen“ der Verwaltung. */
export function AdminInvites() {
  const invites = useAsyncResource(() => adminApi.invites(), []);
  const share = useShareLink();
  const [created, setCreated] = useState<Invite | null>(null);
  const [revoking, setRevoking] = useState<Invite | null>(null);
  const [busy, setBusy] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const onCreated = (invite: Invite) => {
    setCreated(invite);
    void invites.reload(true);
  };

  const revoke = async () => {
    if (!revoking) return;
    setBusy(true);
    setRevokeError(null);
    try {
      await adminApi.revokeInvite(revoking.id);
      if (created?.id === revoking.id) setCreated(null);
      setRevoking(null);
      await invites.reload(true);
    } catch (e) {
      setRevokeError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const items = invites.data?.items ?? [];
  return (
    <div className={styles.section}>
      <div className={styles.top}>
        <InviteForm onCreated={onCreated} />
        {created && <InviteReady invite={created} canShare={share.canShare} onShare={share.share} onCopy={share.copy} />}
      </div>

      <h2 className={styles.title}>Einladungen</h2>
      {invites.loading && !invites.data ? <JournalSkeleton /> : invites.error ? (
        <StateMessage icon="alert" tone="danger" title="Verwaltung konnte nicht geladen werden.">
          <Button iconEnd="refresh" onClick={() => void invites.reload()}>Erneut versuchen</Button>
        </StateMessage>
      ) : items.length === 0 ? (
        <StateMessage icon="users" title="Noch niemand eingeladen." text="Erstelle die erste Einladung." />
      ) : (
        <InviteList invites={items} canShare={share.canShare} onShare={share.share} onCopy={share.copy} onRevoke={setRevoking} />
      )}

      <ConfirmDialog open={revoking !== null} title="Einladung widerrufen?" cancelLabel="Abbrechen" confirmLabel="Widerrufen"
        onCancel={() => setRevoking(null)} onConfirm={() => void revoke()} loading={busy} error={revokeError}>
        Der Einladungslink wird sofort ungültig und kann nicht mehr genutzt werden.
      </ConfirmDialog>
      <Toast message={share.toast?.text ?? null} tone={share.toast?.ok === false ? 'info' : 'success'} onDone={share.clearToast} />
    </div>
  );
}
