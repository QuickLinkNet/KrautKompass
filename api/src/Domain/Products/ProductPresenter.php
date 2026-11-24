<?php

declare(strict_types=1);

namespace KrautKompass\Domain\Products;

use KrautKompass\Core\Config;

/**
 * Wandelt Datenbankzeilen in die API-Form um (Typen, Bild-URLs, JSON-Felder).
 */
final class ProductPresenter
{
    public function __construct(private readonly Config $config)
    {
    }

    /**
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    public function present(array $row, bool $withDetails = false): array
    {
        $data = [
            'id' => (int) $row['id'],
            'slug' => $row['slug'],
            'name' => $row['name'],
            'shortName' => $row['short_name'],
            'category' => $row['category'],
            'producer' => $row['producer'],
            'strain' => $row['strain'],
            'genetic' => $row['genetic'],
            'dominance' => $row['dominance'],
            'thc' => $row['thc'] === null ? null : (float) $row['thc'],
            'cbd' => $row['cbd'] === null ? null : (float) $row['cbd'],
            'irradiated' => $row['irradiated'] === null ? null : (bool) $row['irradiated'],
            'available' => (bool) $row['available'],
            'terpenes' => json_decode((string) $row['terpenes'], true) ?: [],
            'imageUrl' => $this->mediaUrl($row['image_path'] ?? null),
            'thumbUrl' => $this->mediaUrl($row['thumb_path'] ?? null) ?? $this->mediaUrl($row['image_path'] ?? null),
            'rating' => [
                'average' => $row['avg_overall'] === null ? null : (float) $row['avg_overall'],
                'count' => (int) ($row['rating_count'] ?? 0),
            ],
            'favorite' => (bool) ($row['is_favorite'] ?? false),
        ];
        if ($withDetails) {
            $data += [
                'description' => $row['description'],
                'origin' => $row['origin'],
                'grower' => $row['grower'],
                'price' => $row['price'] === null ? null : (float) $row['price'],
                'shopUrl' => rtrim($this->config->string('sync.base_url'), '/') . '/product/' . $row['slug'],
                'syncedAt' => $row['details_synced_at'],
            ];
        }
        return $data;
    }

    private function mediaUrl(mixed $path): ?string
    {
        if (!is_string($path) || $path === '') {
            return null;
        }
        return rtrim($this->config->string('paths.media_url'), '/') . '/' . ltrim($path, '/');
    }
}
