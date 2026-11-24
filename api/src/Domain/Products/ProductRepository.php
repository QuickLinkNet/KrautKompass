<?php

declare(strict_types=1);

namespace KrautKompass\Domain\Products;

use KrautKompass\Core\Database\Database;
use KrautKompass\Support\Clock;

/**
 * Produktkatalog inkl. Aggregat der für die Gruppe sichtbaren Bewertungen.
 * Liefert Rohzeilen; die API-Darstellung übernimmt ProductPresenter.
 *
 * Bewusst nur klassisches SQL (keine JSON-Funktionen, kein Upsert, kein RETURNING):
 * der Webspace hat SQLite 3.7. Listen in JSON-Spalten werden per instr() auf '"Wert"' gefiltert.
 */
final class ProductRepository
{
    /** Gruppen-Durchschnitt (nur für die Runde sichtbare Bewertungen) */
    private const AVG_SQL = "(SELECT ROUND(AVG(r.overall), 1) FROM ratings r
        WHERE r.product_id = p.id AND r.visibility = 'group')";

    private const SORTS = [
        'popular' => 'rating_count DESC, avg_overall IS NULL, avg_overall DESC, p.name COLLATE NOCASE',
        'rating' => 'avg_overall IS NULL, avg_overall DESC, rating_count DESC, p.name COLLATE NOCASE',
        'thc' => 'p.thc IS NULL, p.thc DESC, p.name COLLATE NOCASE',
        'thc_asc' => 'p.thc IS NULL, p.thc ASC, p.name COLLATE NOCASE',
        'newest' => 'p.created_at DESC, p.id DESC',
        'name' => 'p.name COLLATE NOCASE ASC',
    ];

    // Fehlende Werte zählen als 0 % (im Shop meist bei CBD unter der Nachweisgrenze).
    // Zahlen werden als Text gebunden, daher CAST – Ausdrücke ohne Spalten-Affinität vergleichen sonst als Text.
    private const RANGES = [
        'thcMin' => 'COALESCE(p.thc, 0) >=', 'thcMax' => 'COALESCE(p.thc, 0) <=',
        'cbdMin' => 'COALESCE(p.cbd, 0) >=', 'cbdMax' => 'COALESCE(p.cbd, 0) <=',
    ];

    public function __construct(private readonly Database $db)
    {
    }

    /**
     * @param array{q?: ?string, producer?: ?string, genetic?: ?string, terpene?: ?string,
     *              available?: bool, favorites?: bool, thcMin?: ?float, thcMax?: ?float,
     *              cbdMin?: ?float, cbdMax?: ?float, minRating?: ?float, effects?: list<string>,
     *              sort?: ?string} $filters
     * @return array{items: list<array<string, mixed>>, total: int}
     */
    public function search(array $filters, int $viewerId, int $page, int $perPage): array
    {
        $where = ['p.active = 1'];
        $params = [];
        if (!empty($filters['q'])) {
            $like = "LIKE :q ESCAPE '!'";
            $where[] = "(p.name $like OR p.strain $like OR p.producer $like)";
            $params['q'] = '%' . strtr($filters['q'], ['!' => '!!', '%' => '!%', '_' => '!_']) . '%';
        }
        foreach (['producer', 'genetic'] as $field) {
            if (!empty($filters[$field])) {
                $where[] = "p.$field = :$field";
                $params[$field] = $filters[$field];
            }
        }
        if (!empty($filters['terpene'])) {
            $where[] = 'instr(p.terpenes, :terpene) > 0';
            $params['terpene'] = self::jsonNeedle($filters['terpene']);
        }
        foreach (self::RANGES as $key => $sql) {
            if (isset($filters[$key])) {
                $where[] = "$sql CAST(:$key AS REAL)";
                $params[$key] = $filters[$key];
            }
        }
        if (isset($filters['minRating'])) {
            $where[] = self::AVG_SQL . ' >= CAST(:minRating AS REAL)';
            $params['minRating'] = $filters['minRating'];
        }
        if (!empty($filters['effects'])) {
            $any = [];
            foreach (array_values($filters['effects']) as $i => $effect) {
                $any[] = "instr(r.effects, :effect$i) > 0";
                $params["effect$i"] = self::jsonNeedle($effect);
            }
            $where[] = "EXISTS (SELECT 1 FROM ratings r WHERE r.product_id = p.id AND r.visibility = 'group' AND ("
                . implode(' OR ', $any) . '))';
        }
        if (!empty($filters['available'])) {
            $where[] = 'p.available = 1';
        }
        if (!empty($filters['favorites'])) {
            $where[] = 'EXISTS (SELECT 1 FROM favorites f WHERE f.product_id = p.id AND f.user_id = :favUser)';
            $params['favUser'] = $viewerId;
        }
        $whereSql = implode(' AND ', $where);
        $order = self::SORTS[$filters['sort'] ?? 'popular'] ?? self::SORTS['popular'];

        $total = (int) $this->db->scalar("SELECT COUNT(*) FROM products p WHERE $whereSql", $params);
        $items = $this->db->all(
            $this->selectWithAggregate() . " WHERE $whereSql ORDER BY $order LIMIT :limit OFFSET :offset",
            [...$params, 'viewer' => $viewerId, 'limit' => $perPage, 'offset' => ($page - 1) * $perPage],
        );
        return ['items' => $items, 'total' => $total];
    }

    /** @return array<string, mixed>|null */
    public function find(int $id, int $viewerId = 0): ?array
    {
        return $this->db->one($this->selectWithAggregate() . ' WHERE p.id = :id', ['id' => $id, 'viewer' => $viewerId]);
    }

    /** @return array<string, mixed>|null */
    public function findBySource(string $source, string $externalId): ?array
    {
        return $this->db->one(
            'SELECT * FROM products WHERE source = ? AND external_id = ?',
            [$source, $externalId],
        );
    }

    /** @param array<string, mixed> $data Spalten der products-Tabelle */
    public function upsert(string $source, string $externalId, array $data): int
    {
        $existing = $this->findBySource($source, $externalId);
        $data['updated_at'] = Clock::now();
        if ($existing !== null) {
            $this->db->update('products', $data, ['id' => $existing['id']]);
            return (int) $existing['id'];
        }
        return $this->db->insert('products', [
            ...$data,
            'source' => $source,
            'external_id' => $externalId,
            'created_at' => Clock::now(),
        ]);
    }

    public function countActive(string $source): int
    {
        return (int) $this->db->scalar('SELECT COUNT(*) FROM products WHERE source = ? AND active = 1', [$source]);
    }

    /** @param list<string> $keepExternalIds Produkte, die nicht mehr im Shop sind, werden inaktiv. */
    public function deactivateMissing(string $source, array $keepExternalIds): int
    {
        if ($keepExternalIds === []) {
            return 0;
        }
        $placeholders = implode(',', array_fill(0, count($keepExternalIds), '?'));
        return $this->db->run(
            "UPDATE products SET active = 0, available = 0 WHERE source = ? AND active = 1
             AND external_id NOT IN ($placeholders)",
            [$source, ...$keepExternalIds],
        )->rowCount();
    }

    private static function jsonNeedle(string $value): string
    {
        return (string) json_encode($value, JSON_UNESCAPED_UNICODE);
    }

    private function selectWithAggregate(): string
    {
        return 'SELECT p.*, ' . self::AVG_SQL . " AS avg_overall,
                (SELECT COUNT(*) FROM ratings r
                    WHERE r.product_id = p.id AND r.visibility = 'group') AS rating_count,
                EXISTS (SELECT 1 FROM favorites f WHERE f.product_id = p.id AND f.user_id = :viewer) AS is_favorite
            FROM products p";
    }
}
