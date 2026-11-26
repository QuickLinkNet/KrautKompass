import { useState } from 'react';
import { authApi } from '../../../api/endpoints';
import { useSession } from '../../../features/session/sessionContext';
import { Button } from '../../atoms/Button/Button';
import { Icon, type IconName } from '../../atoms/Icon/Icon';
import { Dialog } from '../../molecules/Dialog/Dialog';
import styles from './WelcomeDialog.module.css';

const STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'compass', title: 'Sorte finden', text: 'Im Sortenkatalog suchen, filtern und mit dem Herz merken.' },
  { icon: 'star', title: 'Bewerten', text: 'In unter einer Minute, so oft du willst. Erst nur für dich – teilen entscheidest du.' },
  { icon: 'news', title: 'Mitlesen', text: 'Unter „Neuigkeiten“ siehst du, was die Runde geteilt hat.' },
];

/** Einmalige Begrüßung nach dem ersten Login (pro Konto, gilt auch für die installierte App). */
export function WelcomeDialog() {
  const { user } = useSession();
  const [closed, setClosed] = useState(false);
  if (!user || user.welcomed_at || closed) return null;

  const firstName = user.display_name.trim().split(/\s+/)[0] ?? user.display_name;
  const close = () => {
    setClosed(true);
    // Merken auf dem Server; schlägt das fehl, kommt die Begrüßung beim nächsten Mal eben noch einmal.
    void authApi.updateProfile({ welcomed: true }).catch(() => undefined);
  };

  return (
    <Dialog open onRequestClose={close} title={`Willkommen in der Runde, ${firstName}!`} size="compact"
      footer={<Button block iconEnd="arrowRight" onClick={close}>Los geht’s</Button>}>
      <p className={styles.lead}>
        KrautKompass ist euer privates Bewertungstagebuch für die Sorten von Kraut Kurier.
        Nur eingeladene Mitglieder sehen, was hier passiert.
      </p>
      <ol className={styles.steps}>
        {STEPS.map((s) => (
          <li key={s.title} className={styles.step}>
            <span className={styles.icon}><Icon name={s.icon} size={20} /></span>
            <span><strong>{s.title}</strong><br />{s.text}</span>
          </li>
        ))}
      </ol>
    </Dialog>
  );
}
