import { useState } from 'react';
import { adminApi } from '../../../api/endpoints';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import layout from '../../../styles/layout.module.css';
import { errorMessage } from '../../../utils/errorMessage';
import { formatDate } from '../../../utils/format';
import { Badge } from '../../atoms/Badge/Badge';
import { Button } from '../../atoms/Button/Button';
import { Card } from '../../atoms/Card/Card';
import { Alert } from '../../molecules/Alert/Alert';

const STATUS = { success: ['erfolgreich', 'success'], failed: ['fehlgeschlagen', 'danger'], running: ['läuft', 'primary'] } as const;

/** Produktabgleich mit dem Kraut-Kurier-Shop. */
export function SyncPanel() {
  const runs = useAsyncResource(() => adminApi.syncRuns(), []);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  const start = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const { stats } = await adminApi.startSync();
      setMessage({ tone: 'success', text: `${String(stats.listed)} Sorten abgeglichen, ${String(stats.created)} neu, ${String(stats.details)} aktualisiert.` });
    } catch (e) {
      setMessage({ tone: 'danger', text: errorMessage(e) });
    } finally {
      setBusy(false);
      await runs.reload(true);
    }
  };

  return (
    <Card className={layout.stack}>
      <div className={layout.spread}>
        <h2>Sortenkatalog</h2>
        <Button loading={busy} onClick={() => void start()}>Jetzt mit dem Shop abgleichen</Button>
      </div>
      <p className={layout.muted}>
        Übernimmt Sorten, Beschreibungen, Terpene und Bilder von krautkurier.shop. Nur neue oder geänderte Sorten werden
        neu geladen. Für den Server: Cronjob mit <code>php bin/console products:sync</code>.
      </p>
      {busy && <Alert tone="info">Abgleich läuft. Beim ersten Mal dauert das ein bis zwei Minuten …</Alert>}
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      <div className={layout.tableWrap}>
        <table className={layout.table}>
          <thead><tr><th>Start</th><th>Auslöser</th><th>Status</th><th>Ergebnis</th></tr></thead>
          <tbody>
            {runs.data?.items.map((run) => {
              const [label, tone] = STATUS[run.status];
              return (
                <tr key={run.id}>
                  <td>{formatDate(run.started_at)} {new Date(run.started_at).toLocaleTimeString('de-DE', { timeStyle: 'short' })}</td>
                  <td>{run.trigger === 'cli' ? 'Cron/CLI' : 'Web'}</td>
                  <td><Badge tone={tone}>{label}</Badge></td>
                  <td>{run.error ?? `${String(run.stats.listed ?? 0)} Sorten, ${String(run.stats.details ?? 0)} Details, ${String(run.stats.images ?? 0)} Bilder`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
