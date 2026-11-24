<?php

declare(strict_types=1);

use KrautKompass\Core\Kernel;
use KrautKompass\Domain\Products\ProductRepository;

/** Zweite Sorte neben der aus installed_kernel(): mehr CBD, weniger THC. */
function add_second_product(Kernel $k): int
{
    return $k->container->get(ProductRepository::class)->upsert('krautkurier', '5000', [
        'slug' => 'frozen-lemon', 'name' => 'Frozen Lemon 100% Sativa', 'producer' => 'CanMedics',
        'genetic' => 'Sativa', 'thc' => 18.5, 'cbd' => 6.0, 'terpenes' => '["Myrcen","Limonen"]', 'available' => 0,
    ]);
}

/** @return list<string> Namen der gefundenen Sorten */
function catalog(Kernel $k, array $query): array
{
    $res = api($k, 'GET', '/api/products', null, $query);
    assert_same(200, $res['status'], json_encode($res['json']));
    return array_column($res['json']['items'], 'name');
}

return [
    'Filter nach THC/CBD-Spanne, Terpen, Verfügbarkeit und Suche mit Sonderzeichen' => static function (): void {
        [$k] = installed_kernel();
        add_second_product($k);
        assert_same(['Frozen Lemon 100% Sativa'], catalog($k, ['thcMax' => '20']));
        assert_same(['Luana 28/1 LMO Larrys GMO'], catalog($k, ['thcMin' => '25', 'cbdMax' => '1']));
        assert_same(['Frozen Lemon 100% Sativa'], catalog($k, ['terpene' => 'Myrcen']));
        assert_same(2, count(catalog($k, ['terpene' => 'Limonen'])));
        assert_same(['Luana 28/1 LMO Larrys GMO'], catalog($k, ['available' => '1']));
        assert_same(['Frozen Lemon 100% Sativa'], catalog($k, ['q' => '100%']));
        assert_same([], catalog($k, ['q' => '%_']));
    },

    'Facetten liefern Terpene ohne JSON-Funktionen und die THC/CBD-Obergrenzen' => static function (): void {
        [$k] = installed_kernel();
        add_second_product($k);
        $facets = api($k, 'GET', '/api/products/facets')['json'];
        assert_same(['Limonen', 'Myrcen', 'Pinene'], $facets['terpenes']);
        assert_same(28.0, $facets['thcMax']);
        assert_same(6.0, $facets['cbdMax']);
    },

    'Wirkung und Mindestbewertung filtern über Gruppenbewertungen, private zählen nicht' => static function (): void {
        [$k, $luana] = installed_kernel();
        $lemon = add_second_product($k);
        api($k, 'PUT', "/api/products/$luana/rating", ['overall' => 9, 'effects' => ['schlaffoerdernd'], 'visibility' => 'group']);
        api($k, 'PUT', "/api/products/$lemon/rating", ['overall' => 10, 'effects' => ['kreativ'], 'visibility' => 'private']);
        assert_same(['Luana 28/1 LMO Larrys GMO'], catalog($k, ['effects' => 'schlaffoerdernd,unbekannt']));
        assert_same([], catalog($k, ['effects' => 'kreativ']));
        assert_same(['Luana 28/1 LMO Larrys GMO'], catalog($k, ['minRating' => '8']));
        $items = api($k, 'GET', '/api/products', null, ['sort' => 'popular'])['json']['items'];
        assert_same('Luana 28/1 LMO Larrys GMO', $items[0]['name']);
        assert_same(['schlaffoerdernd'], $items[0]['topEffects']);
        assert_same([], $items[1]['topEffects']);
    },

    'Merkliste ist persönlich, idempotent und filterbar' => static function (): void {
        [$k, $luana] = installed_kernel();
        add_second_product($k);
        assert_same(200, api($k, 'PUT', "/api/products/$luana/favorite")['status']);
        assert_same(200, api($k, 'PUT', "/api/products/$luana/favorite")['status']);
        assert_same(['Luana 28/1 LMO Larrys GMO'], catalog($k, ['favorites' => '1']));
        assert_same(true, api($k, 'GET', "/api/products/$luana")['json']['product']['favorite']);
        assert_same(404, api($k, 'PUT', '/api/products/9999/favorite')['status']);

        invite_and_register($k, 'Mia', 'mia@test.de');
        assert_same([], catalog($k, ['favorites' => '1']));

        api($k, 'POST', '/api/auth/logout');
        api($k, 'POST', '/api/auth/login', ['email' => 'admin@test.de', 'password' => 'geheim-geheim']);
        api($k, 'DELETE', "/api/products/$luana/favorite");
        assert_same([], catalog($k, ['favorites' => '1']));
    },

    'Kein SQL, das der Webspace (SQLite 3.7) nicht kann' => static function (): void {
        $forbidden = [
            '/\bjson_(each|extract|group_array|object|array|tree)\s*\(/i' => 'JSON1-Funktionen',
            '/ON\s+CONFLICT/i' => 'Upsert',
            '/\bRETURNING\b/' => 'RETURNING',
            '/\bOVER\s*\(/i' => 'Window-Functions',
            '/\bWITHOUT\s+ROWID\b/i' => 'WITHOUT ROWID',
            '/\bGENERATED\s+ALWAYS\b/i' => 'generierte Spalten',
            '/\)\s*STRICT\b/' => 'STRICT-Tabellen',
            '/\bIIF\s*\(/i' => 'IIF',
            '/\bWITH\s+(RECURSIVE\s+)?\w+\s+AS\s*\(/i' => 'CTEs (erst ab 3.8.3)',
            '/CREATE\s+(UNIQUE\s+)?INDEX[^;]*\bWHERE\b/i' => 'partielle Indizes',
            '/(RENAME|DROP)\s+COLUMN/i' => 'ALTER TABLE RENAME/DROP COLUMN',
        ];
        $root = dirname(__DIR__);
        $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root . '/src'));
        $paths = [...array_map('strval', iterator_to_array($files)), ...(glob($root . '/database/migrations/*.php') ?: [])];
        foreach ($paths as $path) {
            if (!str_ends_with($path, '.php')) {
                continue;
            }
            // Nur String-Literale prüfen (dort steht das SQL), nicht Kommentare oder PHP-Funktionen.
            $sql = '';
            foreach (token_get_all((string) file_get_contents($path)) as $token) {
                if (is_array($token) && in_array($token[0], [T_CONSTANT_ENCAPSED_STRING, T_ENCAPSED_AND_WHITESPACE, T_START_HEREDOC], true)) {
                    $sql .= $token[1] . "\n";
                }
            }
            foreach ($forbidden as $pattern => $label) {
                assert_true(preg_match($pattern, $sql) !== 1, "$label in " . basename($path));
            }
        }
    },
];
