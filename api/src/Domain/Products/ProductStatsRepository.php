<?php

declare(strict_types=1);

namespace KrautKompass\Domain\Products;

use KrautKompass\Core\Database\Database;

/**
 * Kennzahlen für den Sortenkatalog: Filter-Facetten und häufigste Wirkungen je Sorte.
 * JSON-Listen werden in PHP ausgewertet (SQLite 3.7 auf dem Webspace kennt keine JSON-Funktionen).
 */
final class ProductStatsRepository
{
    public function __construct(private readonly Database $db)
    {
    }

    /**
     * @return array{producers: list<string>, genetics: list<string>, terpenes: list<string>,
     *               thcMax: float, cbdMax: float}
     */
    public function facets(): array
    {
        $column = fn (string $sql): array => array_column($this->db->all($sql), 'v');
        $terpenes = [];
        foreach ($column('SELECT terpenes AS v FROM products WHERE active = 1') as $json) {
            foreach (json_decode((string) $json, true) ?: [] as $terpene) {
                if (is_string($terpene) && $terpene !== '') {
                    $terpenes[$terpene] = true;
                }
            }
        }
        $terpenes = array_keys($terpenes);
        natcasesort($terpenes);
        $max = $this->db->one('SELECT MAX(thc) AS thc, MAX(cbd) AS cbd FROM products WHERE active = 1') ?? [];
        return [
            'producers' => $column("SELECT DISTINCT producer AS v FROM products
                WHERE active = 1 AND producer IS NOT NULL ORDER BY producer COLLATE NOCASE"),
            'genetics' => $column("SELECT DISTINCT genetic AS v FROM products
                WHERE active = 1 AND genetic IS NOT NULL ORDER BY genetic"),
            'terpenes' => array_values($terpenes),
            'thcMax' => (float) ceil((float) ($max['thc'] ?? 0)),
            'cbdMax' => (float) ceil((float) ($max['cbd'] ?? 0)),
        ];
    }

    /**
     * Häufigste Wirkungen je Sorte laut Gruppenbewertungen (für die Karten).
     * @param list<int> $productIds
     * @return array<int, list<string>>
     */
    public function topEffects(array $productIds, int $limit = 3): array
    {
        if ($productIds === []) {
            return [];
        }
        $placeholders = implode(',', array_fill(0, count($productIds), '?'));
        $counts = [];
        $rows = $this->db->all(
            "SELECT product_id, effects FROM ratings WHERE visibility = 'group' AND product_id IN ($placeholders)",
            $productIds,
        );
        foreach ($rows as $row) {
            $id = (int) $row['product_id'];
            foreach (json_decode((string) $row['effects'], true) ?: [] as $effect) {
                $counts[$id][(string) $effect] = ($counts[$id][(string) $effect] ?? 0) + 1;
            }
        }
        $result = [];
        foreach ($counts as $id => $effects) {
            arsort($effects);
            $result[$id] = array_slice(array_map('strval', array_keys($effects)), 0, $limit);
        }
        return $result;
    }

    /**
     * „Das berichtet die Runde“: nur geteilte Bewertungen, private bleiben außen vor.
     * @return array{count: int, averages: array<string, float|null>, effects: list<array{key: string, count: int}>}
     */
    public function groupSummary(int $productId): array
    {
        $rows = $this->db->all(
            "SELECT taste, aroma, effect, quality, effects FROM ratings WHERE visibility = 'group' AND product_id = ?",
            [$productId],
        );
        $averages = [];
        foreach (['taste', 'aroma', 'effect', 'quality'] as $key) {
            $values = array_filter(array_column($rows, $key), static fn (mixed $v): bool => $v !== null);
            $averages[$key] = $values === [] ? null : round(array_sum($values) / count($values), 2);
        }
        $counts = [];
        foreach ($rows as $row) {
            foreach (json_decode((string) $row['effects'], true) ?: [] as $effect) {
                $counts[(string) $effect] = ($counts[(string) $effect] ?? 0) + 1;
            }
        }
        arsort($counts);
        return [
            'count' => count($rows),
            'averages' => $averages,
            'effects' => array_map(
                static fn (string|int $key, int $count): array => ['key' => (string) $key, 'count' => $count],
                array_keys($counts),
                array_values($counts),
            ),
        ];
    }
}
