import { Button } from '../../atoms/Button/Button';
import { Icon, type IconName } from '../../atoms/Icon/Icon';
import { Dialog } from '../../molecules/Dialog/Dialog';
import styles from './InstallDialog.module.css';

interface InstallDialogProps {
  open: boolean;
  onClose: () => void;
}

const STEPS: { icon: IconName; text: string }[] = [
  { icon: 'share', text: 'Tippe in Safari auf „Teilen“ (unten in der Leiste, auf dem iPad oben).' },
  { icon: 'plusSquare', text: 'Wähle „Zum Home-Bildschirm“. Falls du es nicht siehst: in der Liste nach unten wischen.' },
  { icon: 'check', text: 'Tippe oben rechts auf „Hinzufügen“.' },
];

/** Anleitung für iPhone und iPad: Dort gibt es keinen Installieren-Knopf, nur „Teilen → Zum Home-Bildschirm“. */
export function InstallDialog({ open, onClose }: InstallDialogProps) {
  return (
    <Dialog open={open} onRequestClose={onClose} title="Als App installieren" size="compact"
      footer={<Button block onClick={onClose}>Verstanden</Button>}>
      <p className={styles.lead}>
        So liegt KrautKompass wie eine App auf deinem Home-Bildschirm und startet ohne Browserleiste. Ohne App Store.
      </p>
      <ol className={styles.steps}>
        {STEPS.map((step) => (
          <li key={step.icon} className={styles.step}>
            <span className={styles.icon}><Icon name={step.icon} size={20} /></span>
            <span>{step.text}</span>
          </li>
        ))}
      </ol>
      <p className={styles.note}>Geht auch in Chrome und Edge auf dem iPhone über „Teilen“ (ab iOS 16.4).</p>
    </Dialog>
  );
}
