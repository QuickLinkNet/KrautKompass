import { useState, type FormEvent } from 'react';
import { adminApi } from '../../../api/endpoints';
import type { Invite, Role } from '../../../api/types';
import { errorMessage } from '../../../utils/errorMessage';
import { Button } from '../../atoms/Button/Button';
import { Card } from '../../atoms/Card/Card';
import { Icon } from '../../atoms/Icon/Icon';
import { Input } from '../../atoms/Input/Input';
import { Alert } from '../../molecules/Alert/Alert';
import { FormField } from '../../molecules/FormField/FormField';
import { SegmentedChoice } from '../../molecules/SegmentedChoice/SegmentedChoice';
import styles from './AdminInvites.module.css';

/** Karte „Neue Einladung“: für wen, Mitglied oder Admin. */
export function InviteForm({ onCreated }: { onCreated: (invite: Invite) => void }) {
  const [note, setNote] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { invite } = await adminApi.createInvite({ note: note.trim() || undefined, role });
      setNote('');
      setRole('member');
      onCreated(invite);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className={styles.card}>
      <h2 className={styles.cardTitle}><Icon name="user" size={20} /> Neue Einladung</h2>
      <form className={styles.form} onSubmit={(e) => void submit(e)}>
        {error && <Alert>{error}</Alert>}
        <FormField label="Für wen?" htmlFor="invite-note">
          <Input id="invite-note" placeholder="z. B. Kathrin" value={note} maxLength={60} autoComplete="off"
            onChange={(e) => setNote(e.target.value)} />
        </FormField>
        <SegmentedChoice<Role> label="Rolle" value={role} onChange={(v) => v && setRole(v)}
          options={[{ value: 'member', label: 'Mitglied' }, { value: 'admin', label: 'Admin' }]} />
        <Button type="submit" block icon="send" loading={busy}>Einladung erstellen</Button>
      </form>
    </Card>
  );
}
