<?php

declare(strict_types=1);

use KrautKompass\Core\Database\Database;

// Härtung: generisches Rate-Limiting pro Schlüssel (z. B. IP + Aktion)
// und eine Session-Version pro Benutzer, um alle Sitzungen ungültig machen zu können.
return static function (Database $db): void {
    $db->run(
        'CREATE TABLE rate_limits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL,
            hit_at TEXT NOT NULL
        )'
    );
    $db->run('CREATE INDEX idx_rate_limits_key ON rate_limits (key, hit_at)');

    $db->run('ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 1');
};
