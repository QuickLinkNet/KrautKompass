import { useState } from 'react';
import { adminApi } from '../../../api/endpoints';
import type { SyncRun } from '../../../api/types';
import { formatRunTime, syncResult, triggerLabel } from '../../../features/admin/adminText';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import { errorMessage } from '../../../utils/errorMessage';
import { Button } from '../../atoms/Button/Button';
import { Card } from '../../atoms/Card/Card';
import { Icon, type IconName } from '../../atoms/Icon/Icon';
import { Spinner } from '../../atoms/Spinner/Spinner';
import { Alert } from '../../molecules/Alert/Alert';
import { StateMessage } from '../../molecules/StateMessage/StateMessage';
import { JournalSkeleton } from '../JournalState/JournalState';
import styles from './AdminSync.module.css';

const STATUS: Record<SyncRun['status'], { label: string; icon: IconName; className: string | undefined }> = {
  success: { label: 'Erfolgreich', icon: 'check', className: styles.ok },
  failed: { label: 'Fehlgeschlagen', icon: 'alert', className: styles.failed },
  running: { label: 'Läuft', icon: 'refresh', className: styles.running },
};

/** Bereich „Sortenkatalog“: Abgleich mit dem Kraut-Kurier-Shop und Verlauf. */
export function AdminSync() {
  const runs = useAsyncResource(() => adminApi.syncRuns(), []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      await adminApi.startSync();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
      await runs.reload(true);
    }
  };

  if (runs.loading && !runs.data) return <JournalSkeleton />;
  if (runs.error) {
    return (
      <StateMessage icon="alert" tone="danger" title="Verwaltung konnte nicht geladen werden.">
        <Button iconEnd="refresh" onClick={() => void runs.reload()}>Erneut versuchen</Button>
      </StateMessage>
    );
  }

  const items = runs.data?.items ?? [];
  const lastOk = items.find((r) => r.status === 'success');
  return (
    <div className={styles.section}>
      <Card className={styles.card}>
        <h2 className={styles.title}><Icon name="refresh" size={20} /> Abgleich mit dem Kraut-Kurier-Shop</h2>
        <p className={styles.last}>
          {lastOk
            ? `Zuletzt abgeglichen: ${formatRunTime(lastOk.finished_at ?? lastOk.started_at)} · ${Number(lastOk.stats.listed ?? 0)} Sorten`
            : 'Noch nicht abgeglichen.'}
        </p>
        {busy ? (
          <p className={styles.progress} role="status"><Spinner /> Abgleich läuft … das kann ein paar Minuten dauern</p>
        ) : (
          <Button icon="refresh" onClick={() => void start()}>Jetzt abgleichen</Button>
        )}
        {error && <Alert>{error}</Alert>}
      </Card>

      {items.length > 0 && (
        <section aria-labelledby="sync-history">
          <h2 id="sync-history" className={styles.historyTitle}>Verlauf</h2>
          <ol className={styles.history}>
            {items.map((run) => {
              const s = STATUS[run.status];
              return (
                <li key={run.id} className={styles.run}>
                  <Icon name={s.icon} size={20} className={s.className} />
                  <div>
                    <p className={styles.when}>{formatRunTime(run.started_at)}</p>
                    <p className={styles.meta}>{triggerLabel(run.trigger)} · {s.label}</p>
                    {run.status === 'success' && <p className={styles.meta}>{syncResult(run.stats)}</p>}
                    {run.error && <p className={styles.error}>{run.error}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}
