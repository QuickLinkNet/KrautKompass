import { useState } from 'react';
import { useNavigate } from 'react-router';
import { usePwa } from '../../../features/pwa/usePwa';
import { useSession } from '../../../features/session/sessionContext';
import { Avatar } from '../../atoms/Avatar/Avatar';
import { Icon } from '../../atoms/Icon/Icon';
import { InstallDialog } from '../InstallDialog/InstallDialog';
import styles from './AccountMenu.module.css';

interface AccountMenuProps {
  open: boolean;
  onToggle: () => void;
}

/** Initialen-Kreis in der Kopfzeile mit Name, E-Mail, App installieren und Abmelden. */
export function AccountMenu({ open, onToggle }: AccountMenuProps) {
  const { user, logout } = useSession();
  const navigate = useNavigate();
  const pwa = usePwa();
  const [guideOpen, setGuideOpen] = useState(false);

  const onInstall = () => {
    onToggle();
    if (pwa.canPrompt) void pwa.promptInstall();
    else setGuideOpen(true);
  };

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <button type="button" className={styles.trigger} aria-expanded={open} aria-controls="account-menu"
        aria-label={`Konto von ${user?.display_name ?? ''}`} onClick={onToggle}>
        <Avatar name={user?.display_name ?? null} />
      </button>
      {open && (
        <div id="account-menu" className={styles.menu}>
          <p className={styles.name}>{user?.display_name}</p>
          <p className={styles.mail}>{user?.email}</p>
          {pwa.installable && (
            <button type="button" className={styles.action} onClick={onInstall}>
              <Icon name="download" size={18} /> App installieren
            </button>
          )}
          <button type="button" className={styles.action} onClick={onLogout}>
            <Icon name="logOut" size={18} /> Abmelden
          </button>
        </div>
      )}
      <InstallDialog open={guideOpen} onClose={() => setGuideOpen(false)} />
    </>
  );
}
