import { useSearchParams } from 'react-router';
import { SegmentedChoice } from '../components/molecules/SegmentedChoice/SegmentedChoice';
import { AdminInvites } from '../components/organisms/AdminInvites/AdminInvites';
import { AdminMembers, useAdminUsers } from '../components/organisms/AdminMembers/AdminMembers';
import { AdminSync } from '../components/organisms/AdminSync/AdminSync';
import { PageHero } from '../components/organisms/PageHero/PageHero';
import styles from './AdminPage.module.css';

type Area = 'einladungen' | 'mitglieder' | 'katalog';
const AREAS: Area[] = ['einladungen', 'mitglieder', 'katalog'];

/** Verwaltung (Screen 06, nur Admins): Einladungen, Mitglieder, Sortenkatalog. Bereich steht in der URL. */
export function AdminPage() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('bereich') as Area | null;
  const area: Area = raw && AREAS.includes(raw) ? raw : 'einladungen';
  const users = useAdminUsers();
  const count = users.data ? ` (${users.data.items.length})` : '';

  return (
    <>
      <PageHero id="admin-title" title="Verwaltung" lead="Einladungen, Mitglieder und Sortenkatalog." leadOnPhone />
      <div className={styles.page}>
        <div className={styles.tabs}>
          <SegmentedChoice<Area> label="Bereich" columns={3} value={area}
            onChange={(v) => v && setParams(v === 'einladungen' ? {} : { bereich: v }, { replace: true })}
            options={[
              { value: 'einladungen', label: 'Einladungen', icon: 'mail' },
              { value: 'mitglieder', label: `Mitglieder${count}`, icon: 'users' },
              { value: 'katalog', label: 'Sortenkatalog', icon: 'refresh' },
            ]} />
        </div>
        {area === 'einladungen' && <AdminInvites />}
        {area === 'mitglieder' && <AdminMembers users={users} />}
        {area === 'katalog' && <AdminSync />}
      </div>
    </>
  );
}
