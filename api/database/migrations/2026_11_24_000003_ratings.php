<?php

declare(strict_types=1);

use KrautKompass\Core\Database\Database;

// Eine Bewertung pro Benutzer und Sorte (änderbar). Skalen 1–10, 10 = 5 Sterne.
// Standard ist 'private'; für die Gruppe sichtbar nur, wenn man es bewusst teilt.
return static function (Database $db): void {
    $db->run(
        "CREATE TABLE ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            overall INTEGER NOT NULL CHECK (overall BETWEEN 1 AND 10),
            taste INTEGER CHECK (taste BETWEEN 1 AND 10),
            aroma INTEGER CHECK (aroma BETWEEN 1 AND 10),
            effect INTEGER CHECK (effect BETWEEN 1 AND 10),
            effects TEXT NOT NULL DEFAULT '[]',
            side_effects TEXT NOT NULL DEFAULT '[]',
            method TEXT,
            notes TEXT,
            visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'group')),
            consumed_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE (user_id, product_id)
        )"
    );
    $db->run('CREATE INDEX idx_ratings_product ON ratings (product_id, visibility)');
    $db->run('CREATE INDEX idx_ratings_updated ON ratings (updated_at)');
};
