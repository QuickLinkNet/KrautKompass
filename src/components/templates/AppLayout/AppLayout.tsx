import { Outlet } from 'react-router';
import { AppHeader } from '../../organisms/AppHeader/AppHeader';
import styles from './AppLayout.module.css';

/** Rahmen für alle Seiten nach dem Login. */
export function AppLayout() {
  return (
    <div className={styles.shell}>
      <AppHeader />
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        KrautKompass · privates Bewertungstagebuch · keine Werbung, keine Kaufempfehlung
      </footer>
    </div>
  );
}
