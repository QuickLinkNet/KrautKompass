<?php

declare(strict_types=1);

namespace KrautKompass\Domain\Products;

use KrautKompass\Core\Database\Database;
use KrautKompass\Support\Clock;

/**
 * Produktkatalog inkl. Aggregat der für die Gruppe sichtbaren Bewertungen.
 * Liefert Rohzeilen; die API-Darstellung übernimmt ProductPresenter.
 */
final class ProductRepository
{
    private const SORTS = [
        'name' => 'p.name COLLATE NOCASE ASC',
        'thc' => 'p.thc DESC, p.name',
        'rating' => 'avg_overall IS NULL, avg_overall DESC, p.name',
        'newest' => 'p.created_at DESC',
    ];

    public function __construct(private readonly Database $db)
    {
    }

    /**
     * @param array{q?: ?string, producer?: ?string, genetic?: ?string, terpene?: ?string,
     *              available?: bool, sort?: ?string} $filters
     * @return array{items: list<array<string, mixed>>, total: int}
     */
    public function search(array $filters, int $page, int $perPage): array
    {
        $where = ['p.active = 1'];
        $params = [];
        if (!empty($filters['q'])) {
            $where[] = '(p.name LIKE :q OR p.strain LIKE :q OR p.producer LIKE :q)';
            $params['q'] = '%' . $filters['q'] . '%';
        }
        foreach (['producer', 'genetic'] as $field) {
            if (!empty($filters[$field])) {
                $where[] = "p.$field = :$field";
                $params[$field] = $filters[$field];
            }
        }
        if (!empty($filters['terpene'])) {
            $where[] = 'EXISTS (SELECT 1 FROM json_each(p.terpenes) WHERE json_each.value = :terpene)';
            $params['terpene'] = $filters['terpene'];
        }
        if (!empty($filters['available'])) {
            $where[] = 'p.available = 1';
        }
        $whereSql = implode(' AND ', $where);
        $order = self::SORTS[$filters['sort'] ?? 'name'] ?? self::SORTS['name'];

        $total = (int) $this->db->scalar("SELECT COUNT(*) FROM products p WHERE $whereSql", $params);
        $items = $this->db->all(
            $this->selectWithAggregate() . " WHERE $whereSql ORDER BY $order LIMIT :limit OFFSET :offset",
            [...$params, 'limit' => $perPage, 'offset' => ($page - 1) * $perPage],
        );
        return ['items' => $items, 'total' => $total];
    }

    /** @return array<string, mixed>|null */
    public function find(int $id): ?array
    {
        return $this->db->one($this->selectWithAggregate() . ' WHERE p.id = :id', ['id' => $id]);
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

    /** @return array{producers: list<string>, genetics: list<string>, terpenes: list<string>} */
    public function facets(): array
    {
        $column = fn (string $sql): array => array_column($this->db->all($sql), 'v');
        return [
            'producers' => $column("SELECT DISTINCT producer AS v FROM products
                WHERE active = 1 AND producer IS NOT NULL ORDER BY producer COLLATE NOCASE"),
            'genetics' => $column("SELECT DISTINCT genetic AS v FROM products
                WHERE active = 1 AND genetic IS NOT NULL ORDER BY genetic"),
            'terpenes' => $column("SELECT DISTINCT json_each.value AS v FROM products, json_each(products.terpenes)
                WHERE products.active = 1 ORDER BY v COLLATE NOCASE"),
        ];
    }

    private function selectWithAggregate(): string
    {
        return "SELECT p.*,
                (SELECT ROUND(AVG(r.overall), 1) FROM ratings r
                    WHERE r.product_id = p.id AND r.visibility = 'group') AS avg_overall,
                (SELECT COUNT(*) FROM ratings r
                    WHERE r.product_id = p.id AND r.visibility = 'group') AS rating_count
            FROM products p";
    }
}
