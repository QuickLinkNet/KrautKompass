import { Outlet } from 'react-router';
import { AppHeader } from '../../organisms/AppHeader/AppHeader';
import { AppNotices } from '../../organisms/AppNotices/AppNotices';
import styles from './AppLayout.module.css';

/** Rahmen für alle Seiten nach dem Login. Seiten bestimmen ihre Breite selbst. */
export function AppLayout() {
  return (
    <div className={styles.shell}>
      <AppHeader />
      <AppNotices />
      <main className={styles.main} id="inhalt">
        <Outlet />
      </main>
      <footer className={styles.footer}>
        KrautKompass · privates Bewertungstagebuch · keine Werbung, keine Kaufempfehlung
      </footer>
    </div>
  );
}

/** Standardbreite mit Rand für Seiten ohne eigenes Vollbreiten-Layout. */
export function PageContainer() {
  return (
    <div className={styles.page}>
      <Outlet />
    </div>
  );
}
