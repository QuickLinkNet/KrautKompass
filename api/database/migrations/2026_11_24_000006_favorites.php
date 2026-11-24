<?php

declare(strict_types=1);

use KrautKompass\Core\Database\Database;

// Merkliste: jede Person merkt sich Sorten (privat, nur für sie sichtbar).
return static function (Database $db): void {
    $db->run(
        'CREATE TABLE favorites (
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            created_at TEXT NOT NULL,
            PRIMARY KEY (user_id, product_id)
        )'
    );
    $db->run('CREATE INDEX idx_favorites_product ON favorites (product_id)');
};
