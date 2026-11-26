import { useState } from 'react';
import { usePwa, useOnline } from '../../../features/pwa/usePwa';
import { Button } from '../../atoms/Button/Button';
import { IconButton } from '../../atoms/IconButton/IconButton';
import { Alert } from '../../molecules/Alert/Alert';
import { InstallDialog } from '../InstallDialog/InstallDialog';
import styles from './AppNotices.module.css';

const HINT_KEY = 'kk-install-hint-hidden';

function hintHidden() {
  try {
    return localStorage.getItem(HINT_KEY) === '1';
  } catch {
    return false;
  }
}

/** Hinweise unter der Kopfzeile: offline, neue Version, Tipp zum Installieren. */
export function AppNotices() {
  const pwa = usePwa();
  const online = useOnline();
  const [hideHint, setHideHint] = useState(hintHidden);
  const [guideOpen, setGuideOpen] = useState(false);

  const dismissHint = () => {
    setHideHint(true);
    try {
      localStorage.setItem(HINT_KEY, '1');
    } catch {
      // Privater Modus: Hinweis bleibt nur für diese Sitzung weg
    }
  };
  const install = () => (pwa.canPrompt ? pwa.promptInstall() : setGuideOpen(true));
  const showHint = pwa.installable && !hideHint;

  if (online && !pwa.updateReady && !showHint && !guideOpen) return null;

  return (
    <div className={styles.notices}>
      {!online && (
        <Alert tone="info" icon="wifiOff">
          <p><strong>Keine Verbindung.</strong> Sobald du wieder online bist, geht es weiter. Bis dahin wird nichts gespeichert.</p>
        </Alert>
      )}
      {pwa.updateReady && (
        <Alert tone="success" icon="refresh">
          <div className={styles.row}>
            <p>Eine neue Version von KrautKompass ist da.</p>
            <Button size="sm" onClick={pwa.applyUpdate}>Aktualisieren</Button>
          </div>
        </Alert>
      )}
      {showHint && (
        <Alert tone="info" icon="download">
          <div className={styles.row}>
            <p>Leg KrautKompass als App auf deinen Home-Bildschirm.</p>
            <span className={styles.actions}>
              <Button size="sm" variant="secondary" onClick={install}>{pwa.canPrompt ? 'Installieren' : 'So geht’s'}</Button>
              <IconButton icon="x" label="Hinweis ausblenden" onClick={dismissHint} />
            </span>
          </div>
        </Alert>
      )}
      <InstallDialog open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
