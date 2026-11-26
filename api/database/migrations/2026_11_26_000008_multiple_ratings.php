<?php

declare(strict_types=1);

use KrautKompass\Core\Database\Database;

// Mehrere Bewertungen pro Person und Sorte (Tagebuch): UNIQUE (user_id, product_id) fällt weg.
// SQLite 3.7 kann Constraints nicht löschen, daher Tabelle neu anlegen und Daten übernehmen.
return static function (Database $db): void {
    $db->run(
        "CREATE TABLE ratings_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            overall INTEGER NOT NULL CHECK (overall BETWEEN 1 AND 10),
            taste INTEGER CHECK (taste BETWEEN 1 AND 10),
            aroma INTEGER CHECK (aroma BETWEEN 1 AND 10),
            effect INTEGER CHECK (effect BETWEEN 1 AND 10),
            quality INTEGER CHECK (quality BETWEEN 1 AND 10),
            again TEXT CHECK (again IN ('yes', 'maybe', 'no')),
            effects TEXT NOT NULL DEFAULT '[]',
            side_effects TEXT NOT NULL DEFAULT '[]',
            method TEXT,
            notes TEXT,
            visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'group')),
            consumed_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )"
    );
    $columns = 'id, user_id, product_id, overall, taste, aroma, effect, quality, again, effects, side_effects,
        method, notes, visibility, consumed_at, created_at, updated_at';
    $db->run("INSERT INTO ratings_new ($columns) SELECT $columns FROM ratings");
    $db->run('DROP TABLE ratings');
    $db->run('ALTER TABLE ratings_new RENAME TO ratings');
    $db->run('CREATE INDEX idx_ratings_product ON ratings (product_id, visibility)');
    $db->run('CREATE INDEX idx_ratings_user ON ratings (user_id, product_id)');
    $db->run('CREATE INDEX idx_ratings_updated ON ratings (updated_at)');
};
