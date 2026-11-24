<?php

declare(strict_types=1);

use KrautKompass\Core\Database\Database;

// Passwort-Reset: nur der SHA-256-Hash des Tokens wird gespeichert, Tokens sind befristet und einmalig.
return static function (Database $db): void {
    $db->run(
        'CREATE TABLE password_resets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token_hash TEXT NOT NULL UNIQUE,
            expires_at TEXT NOT NULL,
            used_at TEXT,
            created_at TEXT NOT NULL
        )'
    );
    $db->run('CREATE INDEX idx_password_resets_user ON password_resets (user_id)');
};
