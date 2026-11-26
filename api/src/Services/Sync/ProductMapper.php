<?php

declare(strict_types=1);

namespace KrautKompass\Services\Sync;

/**
 * Reine Abbildung Cannaleo-Daten → Spalten der products-Tabelle. Ohne I/O, daher gut testbar.
 */
final class ProductMapper
{
    /**
     * @param array<string, mixed> $item Eintrag aus /api/v1/shop/products
     * @return array<string, mixed>
     */
    public static function fromListItem(array $item): array
    {
        $price = self::positiveFloat($item['price'] ?? null) ?? self::positiveFloat($item['min_price'] ?? null);
        return [
            'slug' => (string) $item['url'],
            'name' => trim((string) $item['name']),
            'category' => 'flower',
            'producer' => self::text($item['producer_name'] ?? null),
            'strain' => self::text($item['strain_name'] ?? null),
            'genetic' => self::text($item['genetic'] ?? null),
            'dominance' => self::text($item['dominance'] ?? null),
            'thc' => self::number($item['thc'] ?? null),
            'cbd' => self::number($item['cbd'] ?? null),
            'irradiated' => isset($item['irradiated']) ? (int) (bool) $item['irradiated'] : null,
            'origin' => self::text($item['origin'] ?? null),
            'price' => $price,
            // Die Liste fragt nur den Livebestand ab (avail=1); dort steht 1 oder 4, beides ist bestellbar.
            'available' => (int) ((int) ($item['availibility'] ?? 0) > 0),
            'active' => 1,
            'source_updated_at' => self::text($item['updated_at'] ?? $item['released_at'] ?? null),
        ];
    }

    /**
     * @param array<string, mixed> $product pageContext.product aus __NEXT_DATA__ der Detailseite
     * @return array{columns: array<string, mixed>, image: ?string, thumb: ?string}
     */
    public static function fromDetails(array $product): array
    {
        $terpenes = [];
        foreach ($product['cannabis']['terpenes'] ?? [] as $terpene) {
            $label = $terpene['label'] ?? null;
            if (is_string($label) && $label !== '') {
                $terpenes[] = ['label' => $label, 'order' => (int) ($terpene['order'] ?? 0)];
            }
        }
        usort($terpenes, static fn (array $a, array $b): int => $a['order'] <=> $b['order']);

        $attributes = [];
        foreach ($product['attributes'] ?? [] as $attribute) {
            if (is_array($attribute) && isset($attribute['key'])) {
                $attributes[(string) $attribute['key']] = $attribute['value'] ?? null;
            }
        }

        $columns = array_filter([
            'short_name' => self::text($product['shortName'] ?? null),
            'description' => self::cleanDescription($product['description'] ?? null),
            'producer' => self::text($product['manufacturer']['name'] ?? null),
            'grower' => self::text($product['cannabis']['grower']['name'] ?? null),
            'strain' => self::text($product['cannabis']['strain']['name'] ?? null),
            'origin' => self::text($attributes['origin'] ?? null),
            'price' => self::positiveFloat($product['variants'][0]['price'] ?? null),
        ], static fn (mixed $v): bool => $v !== null);
        $columns['terpenes'] = json_encode(array_column($terpenes, 'label'), JSON_UNESCAPED_UNICODE);

        $image = $product['images'][0] ?? null;
        return [
            'columns' => $columns,
            'image' => is_array($image) ? self::text($image['url'] ?? null) : null,
            'thumb' => is_array($image) ? self::text($image['formats']['small']['url'] ?? null) : null,
        ];
    }

    public static function cleanDescription(mixed $text): ?string
    {
        if (!is_string($text)) {
            return null;
        }
        $clean = trim(preg_replace("/\n{3,}/", "\n\n", str_replace('::br', "\n", $text)) ?? '');
        return $clean === '' ? null : $clean;
    }

    private static function text(mixed $value): ?string
    {
        return is_string($value) && trim($value) !== '' ? trim($value) : null;
    }

    private static function number(mixed $value): ?float
    {
        return is_numeric($value) ? (float) $value : null;
    }

    private static function positiveFloat(mixed $value): ?float
    {
        return is_numeric($value) && (float) $value > 0 ? (float) $value : null;
    }
}
