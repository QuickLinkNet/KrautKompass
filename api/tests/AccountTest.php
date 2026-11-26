<?php

declare(strict_types=1);

// Passwort ändern über PATCH /api/auth/me (Kontoseite)
return [
    'Passwort ändern prüft das aktuelle Passwort und gilt danach für den Login' => static function (): void {
        [$k] = installed_kernel();
        $wrong = api($k, 'PATCH', '/api/auth/me', ['current_password' => 'falsch-falsch', 'new_password' => 'neues-passwort-1']);
        assert_same(422, $wrong['status']);
        assert_true(isset($wrong['json']['error']['fields']['current_password']) || str_contains(json_encode($wrong['json']), 'current_password'));

        $short = api($k, 'PATCH', '/api/auth/me', ['current_password' => 'geheim-geheim', 'new_password' => 'kurz']);
        assert_same(422, $short['status']);

        $ok = api($k, 'PATCH', '/api/auth/me', ['current_password' => 'geheim-geheim', 'new_password' => 'neues-passwort-1']);
        assert_same(200, $ok['status'], json_encode($ok['json']));

        api($k, 'POST', '/api/auth/logout');
        assert_same(401, api($k, 'POST', '/api/auth/login', ['email' => 'admin@test.de', 'password' => 'geheim-geheim'])['status']);
        assert_same(200, api($k, 'POST', '/api/auth/login', ['email' => 'admin@test.de', 'password' => 'neues-passwort-1'])['status']);
    },
];
