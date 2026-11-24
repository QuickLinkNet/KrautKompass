<?php

declare(strict_types=1);

namespace KrautKompass\Domain\Ratings;

use KrautKompass\Core\Config;

final class RatingPresenter
{
    public function __construct(private readonly Config $config)
    {
    }

    /**
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    public function present(array $row, int $viewerId): array
    {
        $int = static fn (mixed $v): ?int => $v === null ? null : (int) $v;
        $thumb = $row['product_thumb'] ?? null;
        return [
            'id' => (int) $row['id'],
            'productId' => (int) $row['product_id'],
            'productName' => $row['product_name'] ?? null,
            'productThumbUrl' => is_string($thumb) && $thumb !== ''
                ? rtrim($this->config->string('paths.media_url'), '/') . '/' . $thumb
                : null,
            'author' => ['id' => (int) $row['user_id'], 'name' => $row['author_name'] ?? null],
            'isMine' => (int) $row['user_id'] === $viewerId,
            'overall' => (int) $row['overall'],
            'taste' => $int($row['taste']),
            'aroma' => $int($row['aroma']),
            'effect' => $int($row['effect']),
            'effects' => json_decode((string) $row['effects'], true) ?: [],
            'sideEffects' => json_decode((string) $row['side_effects'], true) ?: [],
            'method' => $row['method'],
            'notes' => $row['notes'],
            'visibility' => $row['visibility'],
            'consumedAt' => $row['consumed_at'],
            'createdAt' => $row['created_at'],
            'updatedAt' => $row['updated_at'],
        ];
    }
}
