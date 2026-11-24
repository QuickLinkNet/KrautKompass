<?php

declare(strict_types=1);

use KrautKompass\Core\Database\Database;

// Produktkatalog (aus dem Kraut-Kurier-Shop synchronisiert) und Sync-Protokoll
return static function (Database $db): void {
    $db->run(
        "CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT NOT NULL,
            external_id TEXT NOT NULL,
            slug TEXT NOT NULL,
            name TEXT NOT NULL,
            short_name TEXT,
            category TEXT NOT NULL DEFAULT 'flower',
            producer TEXT,
            grower TEXT,
            strain TEXT,
            genetic TEXT,
            dominance TEXT,
            thc REAL,
            cbd REAL,
            irradiated INTEGER,
            origin TEXT,
            description TEXT,
            terpenes TEXT NOT NULL DEFAULT '[]',
            price REAL,
            available INTEGER NOT NULL DEFAULT 0,
            active INTEGER NOT NULL DEFAULT 1,
            image_remote_url TEXT,
            image_path TEXT,
            thumb_path TEXT,
            source_updated_at TEXT,
            details_synced_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE (source, external_id)
        )"
    );
    $db->run('CREATE INDEX idx_products_name ON products (name)');
    $db->run('CREATE INDEX idx_products_producer ON products (producer)');

    $db->run(
        "CREATE TABLE sync_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT NOT NULL,
            trigger TEXT NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
            stats TEXT NOT NULL DEFAULT '{}',
            error TEXT,
            started_at TEXT NOT NULL,
            finished_at TEXT
        )"
    );
};
