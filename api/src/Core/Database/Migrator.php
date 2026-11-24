<?php

declare(strict_types=1);

namespace KrautKompass\Core\Database;

/**
 * Führt database/migrations/*.php in Dateinamen-Reihenfolge aus.
 * Jede Migration gibt ein Closure(Database): void zurück. Bereits ausgeführte
 * Migrationen stehen in schema_migrations, so ist jeder Lauf idempotent.
 */
final class Migrator
{
    public function __construct(
        private readonly Database $db,
        private readonly string $directory,
    ) {
    }

    /** @return list<string> Namen der neu ausgeführten Migrationen */
    public function migrate(): array
    {
        $this->db->run(
            'CREATE TABLE IF NOT EXISTS schema_migrations (
                name TEXT PRIMARY KEY,
                applied_at TEXT NOT NULL
            )'
        );

        $pending = $this->pending();
        foreach ($pending as $name) {
            $migration = require $this->directory . '/' . $name . '.php';
            if (!is_callable($migration)) {
                throw new \RuntimeException("Migration $name liefert kein Closure.");
            }
            $this->db->transaction(function (Database $db) use ($migration, $name): void {
                $migration($db);
                $db->insert('schema_migrations', ['name' => $name, 'applied_at' => gmdate('c')]);
            });
        }
        return $pending;
    }

    /** @return list<string> */
    public function pending(): array
    {
        $applied = array_column($this->db->all('SELECT name FROM schema_migrations'), 'name');
        return array_values(array_diff($this->available(), $applied));
    }

    /** @return list<string> */
    private function available(): array
    {
        $files = glob($this->directory . '/*.php') ?: [];
        $names = array_map(static fn (string $f): string => basename($f, '.php'), $files);
        sort($names, SORT_STRING);
        return $names;
    }
}
