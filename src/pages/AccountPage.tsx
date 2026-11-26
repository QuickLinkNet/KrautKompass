import { useSession } from '../features/session/sessionContext';
import { Card } from '../components/atoms/Card/Card';
import { ChangePasswordForm } from '../components/organisms/ChangePasswordForm/ChangePasswordForm';
import styles from './AccountPage.module.css';

/** Mein Konto: Name, E-Mail und Passwort ändern. */
export function AccountPage() {
  const { user } = useSession();
  return (
    <div className={styles.page}>
      <h1>Mein Konto</h1>
      <p className={styles.who}>
        <strong>{user?.display_name}</strong>
        <span>{user?.email}</span>
      </p>
      <Card>
        <h2 className={styles.title}>Passwort ändern</h2>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
