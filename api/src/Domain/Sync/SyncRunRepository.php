<?php

declare(strict_types=1);

namespace KrautKompass\Domain\Sync;

use KrautKompass\Core\Database\Database;
use KrautKompass\Support\Clock;

final class SyncRunRepository
{
    public function __construct(private readonly Database $db)
    {
    }

    /**
     * Startet einen Lauf atomar. Liefert null, wenn schon einer läuft.
     * Hängende Läufe (> 30 Min., z. B. nach einem Abbruch) werden als fehlgeschlagen markiert.
     */
    public function tryStart(string $source, string $trigger): ?int
    {
        return $this->db->transaction(function () use ($source, $trigger): ?int {
            $this->db->run(
                "UPDATE sync_runs SET status = 'failed', error = 'Abgebrochen (Zeitüberschreitung)', finished_at = :now
                 WHERE source = :source AND status = 'running' AND started_at <= :stale",
                ['now' => Clock::now(), 'source' => $source, 'stale' => Clock::minutesAgo(30)],
            );
            $running = $this->db->scalar(
                "SELECT 1 FROM sync_runs WHERE source = ? AND status = 'running'",
                [$source],
            );
            if ($running) {
                return null;
            }
            return $this->db->insert('sync_runs', [
                'source' => $source,
                'trigger' => $trigger,
                'status' => 'running',
                'started_at' => Clock::now(),
            ]);
        });
    }

    /** @param array<string, mixed> $stats */
    public function finish(int $id, string $status, array $stats, ?string $error = null): void
    {
        $this->db->update('sync_runs', [
            'status' => $status,
            'stats' => json_encode($stats, JSON_UNESCAPED_UNICODE),
            'error' => $error,
            'finished_at' => Clock::now(),
        ], ['id' => $id]);
    }

    /** @return list<array<string, mixed>> */
    public function latest(int $limit = 10): array
    {
        $rows = $this->db->all('SELECT * FROM sync_runs ORDER BY id DESC LIMIT ?', [$limit]);
        return array_map(static function (array $row): array {
            $row['stats'] = json_decode((string) $row['stats'], true) ?: [];
            return $row;
        }, $rows);
    }
}
