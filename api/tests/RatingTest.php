<?php

declare(strict_types=1);

return [
    'Blütenqualität und „wieder nehmen“ werden gespeichert, geändert und geprüft' => static function (): void {
        [$k, $id] = installed_kernel();
        $put = static fn (array $body): array => api($k, 'PUT', "/api/products/$id/rating", $body + ['overall' => 8, 'visibility' => 'private']);

        $rating = $put(['quality' => 9, 'again' => 'yes'])['json']['rating'];
        assert_same([9, 'yes'], [$rating['quality'], $rating['again']]);
        $rating = $put([])['json']['rating'];
        assert_same([null, null], [$rating['quality'], $rating['again']], 'Freiwillige Felder lassen sich leeren.');
        assert_same(422, $put(['quality' => 11])['status']);
        assert_same(422, $put(['again' => 'vielleicht'])['status']);
        $mine = api($k, 'GET', "/api/products/$id")['json']['myRating'];
        assert_same(8, $mine['overall']);
    },

    'Auswertung der Runde zählt nur geteilte Bewertungen' => static function (): void {
        [$k, $id] = installed_kernel();
        $summary = static fn (): array => api($k, 'GET', "/api/products/$id")['json']['summary'];
        assert_same(0, $summary()['count']);
        assert_same([], $summary()['effects']);
        assert_same(null, $summary()['averages']['taste']);

        $put = static fn (array $body): array => api($k, 'PUT', "/api/products/$id/rating", $body);
        $put(['overall' => 8, 'taste' => 9, 'effects' => ['entspannend'], 'visibility' => 'private']);
        assert_same(0, $summary()['count'], 'Private Bewertungen fließen nicht ein, auch nicht die eigene.');
        $put(['overall' => 8, 'taste' => 9, 'quality' => 10, 'effects' => ['gluecklich', 'entspannend'], 'visibility' => 'group']);

        invite_and_register($k, 'Anna', 'anna@test.de');
        $put(['overall' => 6, 'taste' => 8, 'effects' => ['entspannend'], 'visibility' => 'group']);
        $result = $summary();
        assert_same(2, $result['count']);
        assert_same(8.5, (float) $result['averages']['taste']);
        assert_same(10.0, (float) $result['averages']['quality']);
        assert_same(null, $result['averages']['aroma']);
        assert_same([['key' => 'entspannend', 'count' => 2], ['key' => 'gluecklich', 'count' => 1]], $result['effects']);
    },
];
