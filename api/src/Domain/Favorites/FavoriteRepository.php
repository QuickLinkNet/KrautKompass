<?php

declare(strict_types=1);

namespace KrautKompass\Domain\Favorites;

use KrautKompass\Core\Database\Database;
use KrautKompass\Support\Clock;

/** Merkliste je Person (nur für sie selbst sichtbar). */
final class FavoriteRepository
{
    public function __construct(private readonly Database $db)
    {
    }

    public function add(int $userId, int $productId): void
    {
        // INSERT OR IGNORE statt Upsert: läuft auch auf SQLite 3.7
        $this->db->run(
            'INSERT OR IGNORE INTO favorites (user_id, product_id, created_at) VALUES (?, ?, ?)',
            [$userId, $productId, Clock::now()],
        );
    }

    public function remove(int $userId, int $productId): void
    {
        $this->db->run('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [$userId, $productId]);
    }
}
