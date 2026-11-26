import type { Invite } from '../../../api/types';
import { inviteLink, inviteStatus, type InviteKind } from '../../../features/admin/adminText';
import { Badge } from '../../atoms/Badge/Badge';
import { Button } from '../../atoms/Button/Button';
import { Icon, type IconName } from '../../atoms/Icon/Icon';
import styles from './AdminInvites.module.css';

const TONE: Record<InviteKind, { tone: 'accent' | 'success' | 'neutral' | 'danger'; icon: IconName }> = {
  open: { tone: 'accent', icon: 'calendar' },
  used: { tone: 'success', icon: 'check' },
  expired: { tone: 'neutral', icon: 'calendar' },
  revoked: { tone: 'danger', icon: 'x' },
};

interface InviteListProps {
  invites: Invite[];
  canShare: boolean;
  onShare: (url: string, name: string | null) => void;
  onCopy: (url: string) => void;
  onRevoke: (invite: Invite) => void;
}

/** Alle Einladungen mit Status; Aktionen nur bei offenen. */
export function InviteList({ invites, canShare, onShare, onCopy, onRevoke }: InviteListProps) {
  return (
    <ul className={styles.list}>
      {invites.map((i) => {
        const status = inviteStatus(i);
        const url = inviteLink(i.code);
        return (
          <li key={i.id} className={styles.row}>
            <span className={styles.who}>
              <Icon name="user" size={20} />
              <strong>{i.note ?? 'Ohne Namen'}</strong>
            </span>
            <span className={styles.badges}>
              <Badge tone="neutral">{i.role === 'admin' ? 'Admin' : 'Mitglied'}</Badge>
              <Badge tone={TONE[status.kind].tone} icon={TONE[status.kind].icon}>{status.label}</Badge>
            </span>
            {status.kind === 'open' && (
              <span className={styles.actions}>
                {canShare && <Button size="sm" variant="secondary" icon="share" onClick={() => onShare(url, i.note)}>Teilen</Button>}
                <Button size="sm" variant="secondary" icon="copy" onClick={() => onCopy(url)}>Link kopieren</Button>
                <Button size="sm" variant="danger" icon="x" onClick={() => onRevoke(i)}>Widerrufen</Button>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
