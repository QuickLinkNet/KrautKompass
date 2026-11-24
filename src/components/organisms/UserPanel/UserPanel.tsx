import { useState } from 'react';
import { adminApi } from '../../../api/endpoints';
import type { User } from '../../../api/types';
import { useSession } from '../../../features/session/sessionContext';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import layout from '../../../styles/layout.module.css';
import { errorMessage } from '../../../utils/errorMessage';
import { formatDate } from '../../../utils/format';
import { Badge } from '../../atoms/Badge/Badge';
import { Button } from '../../atoms/Button/Button';
import { Card } from '../../atoms/Card/Card';
import { Alert } from '../../molecules/Alert/Alert';

export function UserPanel() {
  const { user: me } = useSession();
  const users = useAsyncResource(() => adminApi.users(), []);
  const [error, setError] = useState<string | null>(null);

  const update = async (u: User, data: Parameters<typeof adminApi.updateUser>[1]) => {
    setError(null);
    try {
      await adminApi.updateUser(u.id, data);
      await users.reload(true);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <Card className={layout.stack}>
      <h2>Mitglieder</h2>
      {error && <Alert>{error}</Alert>}
      <div className={layout.tableWrap}>
        <table className={layout.table}>
          <thead><tr><th>Name</th><th>E-Mail</th><th>Rolle</th><th>Letzter Login</th><th /></tr></thead>
          <tbody>
            {users.data?.items.map((u) => (
              <tr key={u.id}>
                <td>{u.display_name} {u.status === 'disabled' && <Badge tone="danger">deaktiviert</Badge>}</td>
                <td>{u.email}</td>
                <td><Badge tone={u.role === 'admin' ? 'primary' : 'neutral'}>{u.role === 'admin' ? 'Admin' : 'Mitglied'}</Badge></td>
                <td>{formatDate(u.last_login_at)}</td>
                <td className={layout.row}>
                  {u.id !== me?.id && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => update(u, { role: u.role === 'admin' ? 'member' : 'admin' })}>
                        {u.role === 'admin' ? 'Zum Mitglied' : 'Zum Admin'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => update(u, { status: u.status === 'active' ? 'disabled' : 'active' })}>
                        {u.status === 'active' ? 'Deaktivieren' : 'Aktivieren'}
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
