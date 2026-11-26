<?php

declare(strict_types=1);

namespace KrautKompass\Domain\Ratings;

use KrautKompass\Core\Database\Database;
use KrautKompass\Support\Clock;

/**
 * Bewertungen (Tagebuch: mehrere pro Person und Sorte möglich).
 * Sichtbarkeit: eigene immer, fremde nur mit visibility = 'group'.
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
    public function find(int $id): ?array
    {
        return $this->db->one(self::SELECT . ' WHERE r.id = ?', [$id]);
    }

    /** @return list<array<string, mixed>> eigene Bewertungen einer Sorte, neueste zuerst */
    public function forUserAndProduct(int $userId, int $productId): array
    {
        return $this->db->all(
            self::SELECT . ' WHERE r.user_id = :user AND r.product_id = :product ORDER BY r.created_at DESC, r.id DESC',
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

    /**
     * Neuigkeiten: ausschließlich mit der Runde geteilte Bewertungen, neueste Änderung zuerst.
     * @return list<array<string, mixed>>
     */
    public function feed(int $viewerId, int $limit, int $offset = 0, ?int $authorId = null, bool $favoritesOnly = false): array
    {
        $where = ["r.visibility = 'group'"];
        $params = ['limit' => $limit, 'offset' => $offset];
        if ($authorId !== null) {
            $where[] = 'r.user_id = :author';
            $params['author'] = $authorId;
        }
        if ($favoritesOnly) {
            $where[] = 'EXISTS (SELECT 1 FROM favorites f WHERE f.product_id = r.product_id AND f.user_id = :viewer)';
            $params['viewer'] = $viewerId;
        }
        return $this->db->all(
            self::SELECT . ' WHERE ' . implode(' AND ', $where) . ' ORDER BY r.updated_at DESC, r.id DESC LIMIT :limit OFFSET :offset',
            $params,
        );
    }

    /** @return list<array{id: int, name: string}> Mitglieder, die schon etwas geteilt haben (für die Personen-Chips) */
    public function feedAuthors(): array
    {
        $rows = $this->db->all(
            "SELECT DISTINCT u.id, u.display_name FROM ratings r JOIN users u ON u.id = r.user_id
             WHERE r.visibility = 'group' ORDER BY u.display_name COLLATE NOCASE",
        );
        return array_map(static fn (array $r): array => ['id' => (int) $r['id'], 'name' => (string) $r['display_name']], $rows);
    }

    /** @param array<string, mixed> $data bereits validierte Felder */
    public function create(int $userId, int $productId, array $data): int
    {
        $now = Clock::now();
        return $this->db->insert('ratings', [
            ...self::encode($data),
            'user_id' => $userId,
            'product_id' => $productId,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    /** Ändert eine eigene Bewertung; false, wenn sie nicht existiert oder jemand anderem gehört. */
    public function update(int $id, int $userId, array $data): bool
    {
        $row = $this->db->one('SELECT id FROM ratings WHERE id = ? AND user_id = ?', [$id, $userId]);
        if ($row === null) {
            return false;
        }
        $this->db->update('ratings', [...self::encode($data), 'updated_at' => Clock::now()], ['id' => $id]);
        return true;
    }

    public function delete(int $id, int $userId): bool
    {
        return $this->db->run('DELETE FROM ratings WHERE id = ? AND user_id = ?', [$id, $userId])->rowCount() > 0;
    }

    /**
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    private static function encode(array $data): array
    {
        return [
            ...$data,
            'effects' => json_encode(array_values($data['effects'] ?? []), JSON_UNESCAPED_UNICODE),
            'side_effects' => json_encode(array_values($data['side_effects'] ?? []), JSON_UNESCAPED_UNICODE),
        ];
    }
}
