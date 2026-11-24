<?php

declare(strict_types=1);

use KrautKompass\Core\Database\Database;

// Benutzer, Einladungen, Einstellungen, Login-Drosselung
return static function (Database $db): void {
    $db->run(
        "CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            display_name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
            status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            last_login_at TEXT
        )"
    );

    $db->run(
        "CREATE TABLE invites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE,
            role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
            note TEXT,
            created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
            used_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
            expires_at TEXT NOT NULL,
            used_at TEXT,
            revoked_at TEXT,
            created_at TEXT NOT NULL
        )"
    );

    $db->run(
        'CREATE TABLE settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )'
    );

    $db->run(
        'CREATE TABLE login_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT NOT NULL,
            email TEXT NOT NULL COLLATE NOCASE,
            attempted_at TEXT NOT NULL
        )'
    );
    $db->run('CREATE INDEX idx_login_attempts_lookup ON login_attempts (ip, email, attempted_at)');
};
