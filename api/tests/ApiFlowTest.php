<?php

declare(strict_types=1);

// Helfer installed_kernel() / invite_and_register() liegen in support.php
return [
    'Frische Instanz meldet "nicht installiert" und sperrt Endpunkte' => static function (): void {
        $k = test_kernel();
        $status = api($k, 'GET', '/api/system/status');
        assert_same(false, $status['json']['installed']);
        assert_true(count($status['json']['requirements']) >= 4);
        assert_same(409, api($k, 'POST', '/api/auth/login', ['email' => 'a@b.de', 'password' => 'x'])['status']);
    },

    'Installation legt Admin an und ist nur einmal möglich' => static function (): void {
        [$k] = installed_kernel();
        $status = api($k, 'GET', '/api/system/status')['json'];
        assert_same(true, $status['installed']);
        assert_same('admin', $status['user']['role']);
        $again = api($k, 'POST', '/api/system/install', [
            'display_name' => 'X', 'email' => 'x@test.de', 'password' => 'geheim-geheim',
        ]);
        assert_same(409, $again['status']);
    },

    'Schreibende Requests ohne CSRF-Token werden abgelehnt' => static function (): void {
        [$k] = installed_kernel();
        assert_same(419, api($k, 'POST', '/api/auth/logout', [], [], false)['status']);
    },

    'Login prüft Passwort und drosselt nach Fehlversuchen' => static function (): void {
        [$k] = installed_kernel();
        api($k, 'POST', '/api/auth/logout');
        assert_same(401, api($k, 'GET', '/api/products')['status']);
        for ($i = 0; $i < 5; $i++) {
            assert_same(401, api($k, 'POST', '/api/auth/login', ['email' => 'admin@test.de', 'password' => 'falsch'])['status']);
        }
        $blocked = api($k, 'POST', '/api/auth/login', ['email' => 'admin@test.de', 'password' => 'geheim-geheim']);
        assert_same(429, $blocked['status']);
    },

    'Registrierung nur mit gültiger Einladung, Code ist einmalig' => static function (): void {
        [$k] = installed_kernel();
        $code = api($k, 'POST', '/api/admin/invites', [])['json']['invite']['code'];
        assert_true((bool) preg_match('/^KK-[A-Z2-9]{4}-[A-Z2-9]{4}$/', $code), "Code-Format: $code");
        api($k, 'POST', '/api/auth/logout');
        assert_same(200, api($k, 'GET', "/api/invites/$code")['status']);
        $data = ['invite_code' => $code, 'display_name' => 'Freundin', 'email' => 'f@test.de', 'password' => 'passwort-123'];
        assert_same(201, api($k, 'POST', '/api/auth/register', $data)['status']);
        api($k, 'POST', '/api/auth/logout');
        $second = api($k, 'POST', '/api/auth/register', [...$data, 'email' => 'g@test.de']);
        assert_same(422, $second['status']);
        assert_same(404, api($k, 'GET', '/api/invites/KK-XXXX-XXXX')['status']);
    },

    'Mitglieder kommen nicht in den Admin-Bereich' => static function (): void {
        [$k] = installed_kernel();
        invite_and_register($k, 'Freundin', 'f@test.de');
        assert_same(403, api($k, 'GET', '/api/admin/users')['status']);
    },

    'Private Bewertungen sieht nur der Autor, geteilte die Gruppe' => static function (): void {
        [$k, $productId] = installed_kernel();
        $put = api($k, 'POST', "/api/products/$productId/ratings", [
            'overall' => 8, 'taste' => 7, 'effects' => ['entspannend', 'kreativ'], 'visibility' => 'private',
            'method' => 'vaporizer', 'notes' => 'Abends top', 'consumed_at' => '2026-11-20',
        ]);
        assert_same(201, $put['status'], json_encode($put['json']));
        assert_same(['entspannend', 'kreativ'], $put['json']['rating']['effects']);

        invite_and_register($k, 'Freundin', 'f@test.de');
        $view = api($k, 'GET', "/api/products/$productId")['json'];
        assert_same([], $view['ratings']);
        assert_same(0, $view['product']['rating']['count']);

        api($k, 'POST', '/api/auth/logout');
        api($k, 'POST', '/api/auth/login', ['email' => 'admin@test.de', 'password' => 'geheim-geheim']);
        api($k, 'POST', "/api/products/$productId/ratings", ['overall' => 9, 'visibility' => 'group']);
        api($k, 'POST', '/api/auth/logout');
        api($k, 'POST', '/api/auth/login', ['email' => 'f@test.de', 'password' => 'passwort-123']);
        $view = api($k, 'GET', "/api/products/$productId")['json'];
        assert_same(1, count($view['ratings']));
        assert_same(9.0, $view['product']['rating']['average']);
        assert_same([], $view['myRatings']);
    },

    'Bewertung lehnt unbekannte Wirkungen und Werte außerhalb der Skala ab' => static function (): void {
        [$k, $productId] = installed_kernel();
        $res = api($k, 'POST', "/api/products/$productId/ratings", [
            'overall' => 11, 'effects' => ['fliegen'], 'visibility' => 'group',
        ]);
        assert_same(422, $res['status']);
        assert_true(isset($res['json']['error']['details']['fields']['overall']));
    },

    'Produktliste filtert nach Terpen und Hersteller' => static function (): void {
        [$k] = installed_kernel();
        $hit = api($k, 'GET', '/api/products', null, ['terpene' => 'Pinene', 'producer' => 'Cannamedical'])['json'];
        assert_same(1, $hit['pagination']['total']);
        assert_same(['Pinene', 'Limonen'], $hit['items'][0]['terpenes']);
        $miss = api($k, 'GET', '/api/products', null, ['terpene' => 'Myrcen'])['json'];
        assert_same(0, $miss['pagination']['total']);
        $facets = api($k, 'GET', '/api/products/facets')['json'];
        assert_same(['Limonen', 'Pinene'], $facets['terpenes']);
    },

    'Der letzte Admin kann sich nicht selbst herabstufen' => static function (): void {
        [$k] = installed_kernel();
        $me = api($k, 'GET', '/api/auth/me')['json']['user'];
        $res = api($k, 'PATCH', "/api/admin/users/{$me['id']}", ['role' => 'member']);
        assert_same(409, $res['status']);
    },
];
