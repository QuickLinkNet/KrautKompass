<?php

declare(strict_types=1);

return [
    'Blütenqualität und „wieder nehmen“ werden gespeichert, geändert und geprüft' => static function (): void {
        [$k, $id] = installed_kernel();
        $created = api($k, 'POST', "/api/products/$id/ratings", ['overall' => 8, 'visibility' => 'private', 'quality' => 9, 'again' => 'yes']);
        assert_same(201, $created['status'], json_encode($created['json']));
        $ratingId = $created['json']['rating']['id'];
        assert_same([9, 'yes'], [$created['json']['rating']['quality'], $created['json']['rating']['again']]);

        $put = static fn (array $body): array => api($k, 'PUT', "/api/ratings/$ratingId", $body + ['overall' => 8, 'visibility' => 'private']);
        $rating = $put([])['json']['rating'];
        assert_same([null, null], [$rating['quality'], $rating['again']], 'Freiwillige Felder lassen sich leeren.');
        assert_same(422, $put(['quality' => 11])['status']);
        assert_same(422, $put(['again' => 'vielleicht'])['status']);
        assert_same(8, api($k, 'GET', "/api/products/$id")['json']['myRatings'][0]['overall']);
    },

    'Mehrere Bewertungen pro Sorte: alle zählen, jede einzeln änder- und löschbar' => static function (): void {
        [$k, $id] = installed_kernel();
        $first = api($k, 'POST', "/api/products/$id/ratings", ['overall' => 6, 'visibility' => 'group'])['json']['rating']['id'];
        $second = api($k, 'POST', "/api/products/$id/ratings", ['overall' => 10, 'visibility' => 'group'])['json']['rating']['id'];
        $view = api($k, 'GET', "/api/products/$id")['json'];
        assert_same([$second, $first], array_column($view['myRatings'], 'id'), 'Neueste zuerst');
        assert_same(2, $view['product']['rating']['count']);
        assert_same(8.0, $view['product']['rating']['average'], 'Durchschnitt über alle Bewertungen');

        assert_same(200, api($k, 'PUT', "/api/ratings/$first", ['overall' => 8, 'visibility' => 'group'])['status']);
        assert_same(204, api($k, 'DELETE', "/api/ratings/$second")['status']);
        $view = api($k, 'GET', "/api/products/$id")['json'];
        assert_same([8], array_column($view['myRatings'], 'overall'));

        // Fremde Bewertungen lassen sich weder ändern noch löschen
        invite_and_register($k, 'Anna', 'anna@test.de');
        assert_same(404, api($k, 'PUT', "/api/ratings/$first", ['overall' => 1, 'visibility' => 'group'])['status']);
        assert_same(404, api($k, 'DELETE', "/api/ratings/$first")['status']);
    },

    'Auswertung der Runde zählt nur geteilte Bewertungen' => static function (): void {
        [$k, $id] = installed_kernel();
        $summary = static fn (): array => api($k, 'GET', "/api/products/$id")['json']['summary'];
        assert_same(0, $summary()['count']);
        assert_same([], $summary()['effects']);
        assert_same(null, $summary()['averages']['taste']);

        $post = static fn (array $body): array => api($k, 'POST', "/api/products/$id/ratings", $body);
        $post(['overall' => 8, 'taste' => 9, 'effects' => ['entspannend'], 'visibility' => 'private']);
        assert_same(0, $summary()['count'], 'Private Bewertungen fließen nicht ein, auch nicht die eigene.');
        $post(['overall' => 8, 'taste' => 9, 'quality' => 10, 'effects' => ['gluecklich', 'entspannend'], 'visibility' => 'group']);

        invite_and_register($k, 'Anna', 'anna@test.de');
        $post(['overall' => 6, 'taste' => 8, 'effects' => ['entspannend'], 'visibility' => 'group']);
        $result = $summary();
        assert_same(2, $result['count']);
        assert_same(8.5, (float) $result['averages']['taste']);
        assert_same(10.0, (float) $result['averages']['quality']);
        assert_same(null, $result['averages']['aroma']);
        assert_same([['key' => 'entspannend', 'count' => 2], ['key' => 'gluecklich', 'count' => 1]], $result['effects']);
    },

    'Neuigkeiten zeigen nur Geteiltes, filtern nach Person und Merkliste und laden nach' => static function (): void {
        [$k, $id] = installed_kernel();
        api($k, 'POST', "/api/products/$id/ratings", ['overall' => 8, 'visibility' => 'private']);
        api($k, 'POST', "/api/products/$id/ratings", ['overall' => 9, 'visibility' => 'group']);
        invite_and_register($k, 'Anna', 'anna@test.de');
        foreach ([5, 6, 7] as $score) {
            api($k, 'POST', "/api/products/$id/ratings", ['overall' => $score, 'visibility' => 'group']);
        }

        $feed = api($k, 'GET', '/api/ratings/feed', null, ['limit' => '2'])['json'];
        assert_same(2, count($feed['items']));
        assert_true($feed['hasMore']);
        assert_same(['Anna', 'Carsten'], array_column($feed['authors'], 'name'));
        assert_same(4, count(api($k, 'GET', '/api/ratings/feed')['json']['items']), 'Die private Bewertung erscheint nirgends.');

        $admin = $feed['authors'][1]['id'];
        $byAdmin = api($k, 'GET', '/api/ratings/feed', null, ['author' => (string) $admin])['json']['items'];
        assert_same([9], array_column($byAdmin, 'overall'));
        $older = api($k, 'GET', '/api/ratings/feed', null, ['limit' => '2', 'offset' => '2'])['json'];
        assert_same(2, count($older['items']));
        assert_true(!$older['hasMore']);

        assert_same([], api($k, 'GET', '/api/ratings/feed', null, ['favorites' => '1'])['json']['items']);
        api($k, 'PUT', "/api/products/$id/favorite", []);
        assert_same(4, count(api($k, 'GET', '/api/ratings/feed', null, ['favorites' => '1'])['json']['items']));
    },
];
