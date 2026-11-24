<?php

declare(strict_types=1);

use KrautKompass\Services\Sync\ProductMapper;

// Echte (gekürzte) Antworten des Kraut-Kurier-Shops vom 24.11.2026
return [
    'Listeneintrag wird auf Spalten abgebildet' => static function (): void {
        $row = ProductMapper::fromListItem([
            'id' => 5024, 'url' => 'enua-27-1-ils-ca-icy-lemonade-soda', 'name' => 'enua 27/1 ILS CA Icy Lemonade Soda',
            'thc' => 27, 'cbd' => 1, 'genetic' => 'Hybrid', 'irradiated' => false, 'origin' => 'Kanada',
            'dominance' => 'Indica', 'strain_name' => 'Icy Lemonade Soda', 'producer_name' => 'enua Pharma',
            'min_price' => 2.99, 'availibility' => 1, 'price' => null, 'updated_at' => '2026-11-04T16:15:41.062Z',
        ]);
        assert_same('enua-27-1-ils-ca-icy-lemonade-soda', $row['slug']);
        assert_same('enua Pharma', $row['producer']);
        assert_same(27.0, $row['thc']);
        assert_same(0, $row['irradiated']);
        assert_same(2.99, $row['price']);
        assert_same(1, $row['available']);
    },

    'Detaildaten liefern Terpene sortiert, Bilder und saubere Beschreibung' => static function (): void {
        $mapped = ProductMapper::fromDetails([
            'shortName' => 'Luana 28/1 LMO',
            'description' => "Luana 28/1 LMO hat eine Hybrid-Genetik.\n::br\n",
            'producerrel' => ['data' => ['attributes' => ['name' => 'Cannamedical']]],
            'grower' => ['data' => null],
            'price' => 2.99,
            'strain' => ['data' => ['attributes' => ['name' => 'Larrys GMO']]],
            'terpenes' => ['data' => [
                ['attributes' => ['labelDE' => 'Limonen', 'order' => 124]],
                ['attributes' => ['labelDE' => 'Pinene', 'order' => 118]],
            ]],
            'image' => ['data' => ['attributes' => [
                'url' => 'https://cdn.example/full.png',
                'formats' => ['small' => ['url' => 'https://cdn.example/small.png']],
            ]]],
        ]);
        assert_same('["Pinene","Limonen"]', $mapped['columns']['terpenes']);
        assert_same('Luana 28/1 LMO hat eine Hybrid-Genetik.', $mapped['columns']['description']);
        assert_same('Larrys GMO', $mapped['columns']['strain']);
        assert_true(!array_key_exists('grower', $mapped['columns']), 'Leere Felder dürfen nichts überschreiben.');
        assert_same('https://cdn.example/full.png', $mapped['image']);
        assert_same('https://cdn.example/small.png', $mapped['thumb']);
    },

    'Produkt ohne Bild liefert null' => static function (): void {
        $mapped = ProductMapper::fromDetails(['image' => ['data' => null]]);
        assert_same(null, $mapped['image']);
        assert_same('[]', $mapped['columns']['terpenes']);
    },
];
