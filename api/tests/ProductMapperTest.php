<?php

declare(strict_types=1);

use KrautKompass\Domain\Products\ProductRepository;
use KrautKompass\Services\Sync\ProductMapper;

// Echte (gekürzte) Antworten des Kraut-Kurier-Shops nach dem Umbau, Stand 26.11.2026
return [
    'Listeneintrag wird auf Spalten abgebildet' => static function (): void {
        $row = ProductMapper::fromListItem([
            'id' => 10638, 'url' => 'enua-27-1-ils-ca-icy-lemonade-soda', 'name' => 'enua 27/1 ILS CA Icy Lemonade Soda',
            'released_at' => '2026-11-04T16:15:41.055Z', 'thc' => 27, 'cbd' => 1, 'genetic' => 'Hybrid',
            'dominance' => 'Indica', 'irradiated' => false, 'producer_name' => 'enua Pharma',
            'strain_name' => 'Icy Lemonade Soda', 'price' => null, 'availibility' => 1, 'unit' => 'g', 'image' => null,
        ]);
        assert_same('enua-27-1-ils-ca-icy-lemonade-soda', $row['slug']);
        assert_same('enua Pharma', $row['producer']);
        assert_same(27.0, $row['thc']);
        assert_same(0, $row['irradiated']);
        assert_same(null, $row['price']);
        assert_same(1, $row['available']);
        assert_same('2026-11-04T16:15:41.055Z', $row['source_updated_at']);
    },

    'Livebestand mit „availibility = 4“ bleibt lieferbar, 0 nicht' => static function (): void {
        assert_same(1, ProductMapper::fromListItem(['id' => 1, 'url' => 'x', 'name' => 'X', 'availibility' => 4])['available']);
        assert_same(0, ProductMapper::fromListItem(['id' => 1, 'url' => 'x', 'name' => 'X', 'availibility' => 0])['available']);
    },

    'Detaildaten liefern Terpene sortiert, Herkunft, Preis, Bild und saubere Beschreibung' => static function (): void {
        $mapped = ProductMapper::fromDetails([
            'shortName' => 'Good Supply THC25 AOG',
            'description' => "Good Supply THC25 AOG hat eine Hybrid-Genetik.\n::br\n",
            'manufacturer' => ['id' => 42, 'name' => 'Tilray'],
            'cannabis' => [
                'strain' => ['name' => 'Amnesia OG'],
                'grower' => null,
                'terpenes' => [
                    ['label' => 'Beta-Caryophyllen', 'order' => 141],
                    ['label' => 'Terpinolen', 'order' => 117],
                ],
            ],
            'attributes' => [
                ['key' => 'thc', 'value' => 25],
                ['key' => 'origin', 'value' => 'Portugal'],
            ],
            'variants' => [['price' => 2.99, 'availibility' => 1]],
            'images' => [['url' => 'https://cannaleo.fra1.digitaloceanspaces.com/cannaleo_apo/a.png', 'formats' => null]],
        ]);
        assert_same('["Terpinolen","Beta-Caryophyllen"]', $mapped['columns']['terpenes']);
        assert_same('Good Supply THC25 AOG hat eine Hybrid-Genetik.', $mapped['columns']['description']);
        assert_same('Tilray', $mapped['columns']['producer']);
        assert_same('Amnesia OG', $mapped['columns']['strain']);
        assert_same('Portugal', $mapped['columns']['origin']);
        assert_same(2.99, $mapped['columns']['price']);
        assert_true(!array_key_exists('grower', $mapped['columns']), 'Leere Felder dürfen nichts überschreiben.');
        assert_same('https://cannaleo.fra1.digitaloceanspaces.com/cannaleo_apo/a.png', $mapped['image']);
        assert_same(null, $mapped['thumb']);
    },

    'Produkt ohne Bild liefert null' => static function (): void {
        $mapped = ProductMapper::fromDetails(['images' => []]);
        assert_same(null, $mapped['image']);
        assert_same('[]', $mapped['columns']['terpenes']);
    },

    'Neue Shop-ID mit gleichem Slug übernimmt das bekannte Produkt' => static function (): void {
        [$k] = installed_kernel();
        $repo = $k->container->get(ProductRepository::class);
        $id = $repo->upsert('krautkurier', '5024', ['slug' => 'enua-27-1-ils', 'name' => 'enua 27/1 ILS']);
        $adopted = $repo->adoptBySlug('krautkurier', 'enua-27-1-ils', '10638');
        assert_same($id, (int) $adopted['id']);
        assert_same(null, $repo->findBySource('krautkurier', '5024'));
        assert_same($id, (int) $repo->findBySource('krautkurier', '10638')['id']);
        assert_same(null, $repo->adoptBySlug('krautkurier', 'unbekannt', '1'));
    },
];
