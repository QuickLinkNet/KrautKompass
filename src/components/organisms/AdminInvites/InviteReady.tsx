import type { Invite } from '../../../api/types';
import { formatValidUntil, inviteLink } from '../../../features/admin/adminText';
import { Button } from '../../atoms/Button/Button';
import { Icon } from '../../atoms/Icon/Icon';
import { IconButton } from '../../atoms/IconButton/IconButton';
import styles from './AdminInvites.module.css';

interface InviteReadyProps {
  invite: Invite;
  canShare: boolean;
  onShare: (url: string, name: string | null) => void;
  onCopy: (url: string) => void;
}

/** Hervorgehobene Karte nach dem Erstellen: Link teilen oder kopieren. */
export function InviteReady({ invite, canShare, onShare, onCopy }: InviteReadyProps) {
  const url = inviteLink(invite.code);
  return (
    <section className={styles.ready} aria-labelledby="invite-ready">
      <h2 id="invite-ready" className={styles.cardTitle}>
        <span className={styles.readyIcon}><Icon name="check" size={20} /></span>
        {invite.note ? `Einladung für ${invite.note} ist bereit` : 'Einladung ist bereit'}
      </h2>
      <div className={styles.link}>
        <span className={styles.linkText}>{url}</span>
        <IconButton icon="copy" label="Link kopieren" onClick={() => onCopy(url)} />
      </div>
      <div className={styles.readyActions}>
        {canShare && <Button variant="secondary" icon="share" onClick={() => onShare(url, invite.note)}>Teilen</Button>}
        <Button variant="secondary" icon="copy" onClick={() => onCopy(url)}>Link kopieren</Button>
      </div>
      <p className={styles.hint}><Icon name="calendar" size={16} />{formatValidUntil(invite.expires_at)}</p>
    </section>
  );
}
