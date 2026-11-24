<?php

declare(strict_types=1);

namespace KrautKompass\Domain\Ratings;

use KrautKompass\Core\Database\Database;
use KrautKompass\Support\Clock;

/**
 * Bewertungen. Sichtbarkeit: eigene immer, fremde nur mit visibility = 'group'.
 */
final class RatingRepository
{
    private const SELECT = "SELECT r.*, u.display_name AS author_name,
            p.name AS product_name, p.thumb_path AS product_thumb
        FROM ratings r
        JOIN users u ON u.id = r.user_id
        JOIN products p ON p.id = r.product_id";

    public function __construct(private readonly Database $db)
    {
    }

    /** @return array<string, mixed>|null */
    public function findForUser(int $userId, int $productId): ?array
    {
        return $this->db->one(
            self::SELECT . ' WHERE r.user_id = :user AND r.product_id = :product',
            ['user' => $userId, 'product' => $productId],
        );
    }

    /** @return list<array<string, mixed>> Bewertungen einer Sorte, die der Benutzer sehen darf */
    public function visibleForProduct(int $productId, int $viewerId): array
    {
        return $this->db->all(
            self::SELECT . " WHERE r.product_id = :product AND (r.visibility = 'group' OR r.user_id = :viewer)
             ORDER BY r.updated_at DESC",
            ['product' => $productId, 'viewer' => $viewerId],
        );
    }

    /** @return list<array<string, mixed>> */
    public function byUser(int $userId): array
    {
        return $this->db->all(self::SELECT . ' WHERE r.user_id = ? ORDER BY r.updated_at DESC', [$userId]);
    }

    /** @return list<array<string, mixed>> neueste geteilte Bewertungen (plus eigene) */
    public function feed(int $viewerId, int $limit): array
    {
        return $this->db->all(
            self::SELECT . " WHERE r.visibility = 'group' OR r.user_id = :viewer
             ORDER BY r.updated_at DESC LIMIT :limit",
            ['viewer' => $viewerId, 'limit' => $limit],
        );
    }

    /** @param array<string, mixed> $data bereits validierte Felder */
    public function upsert(int $userId, int $productId, array $data): void
    {
        $now = Clock::now();
        $row = [
            ...$data,
            'effects' => json_encode(array_values($data['effects'] ?? []), JSON_UNESCAPED_UNICODE),
            'side_effects' => json_encode(array_values($data['side_effects'] ?? []), JSON_UNESCAPED_UNICODE),
        ];
        $existing = $this->findForUser($userId, $productId);
        if ($existing !== null) {
            $this->db->update('ratings', [...$row, 'updated_at' => $now], ['id' => $existing['id']]);
            return;
        }
        $this->db->insert('ratings', [
            ...$row,
            'user_id' => $userId,
            'product_id' => $productId,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    public function delete(int $userId, int $productId): bool
    {
        return $this->db->run(
            'DELETE FROM ratings WHERE user_id = ? AND product_id = ?',
            [$userId, $productId],
        )->rowCount() > 0;
    }
}
