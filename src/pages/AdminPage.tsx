import { InvitePanel } from '../components/organisms/InvitePanel/InvitePanel';
import { SyncPanel } from '../components/organisms/SyncPanel/SyncPanel';
import { UserPanel } from '../components/organisms/UserPanel/UserPanel';
import layout from '../styles/layout.module.css';

export function AdminPage() {
  return (
    <div className={layout.stack}>
      <h1>Verwaltung</h1>
      <InvitePanel />
      <UserPanel />
      <SyncPanel />
    </div>
  );
}
