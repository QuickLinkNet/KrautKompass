<?php

declare(strict_types=1);

const ENV_ADMIN = ['admin' => [
    'email' => 'Carsten@Kraut-Kurier.de', 'password' => 'sehr-geheim-123', 'name' => 'Carsten', 'instance_name' => 'Kraut Kurier',
]];

return [
    'Admin aus der .env wird beim ersten Statusaufruf angelegt und kann sich anmelden' => static function (): void {
        $k = test_kernel(ENV_ADMIN);
        $status = api($k, 'GET', '/api/system/status')['json'];
        assert_same(true, $status['installed']);
        assert_same('Kraut Kurier', $status['instanceName']);
        $login = api($k, 'POST', '/api/auth/login', ['email' => 'carsten@kraut-kurier.de', 'password' => 'sehr-geheim-123']);
        assert_same(200, $login['status'], json_encode($login['json']));
        assert_same('admin', $login['json']['user']['role']);
        assert_same('Carsten', $login['json']['user']['display_name']);
    },

    'Mit Admin in der .env ist die Einrichtung im Browser gesperrt' => static function (): void {
        $k = test_kernel(['admin' => ['email' => 'a@test.de', 'password' => 'kurz']]);
        $status = api($k, 'GET', '/api/system/status')['json'];
        assert_same(false, $status['installed']);
        $failed = array_values(array_filter($status['requirements'], static fn (array $r): bool => !$r['ok']));
        assert_same('admin_env', $failed[0]['key'] ?? null);
        $res = api($k, 'POST', '/api/system/install', [
            'display_name' => 'Fremder', 'email' => 'fremd@test.de', 'password' => 'geheim-geheim',
        ]);
        assert_same(403, $res['status']);
        assert_same(false, api($k, 'GET', '/api/system/status')['json']['installed']);
    },

    'Ein späteres Ändern der .env überschreibt den bestehenden Admin nicht' => static function (): void {
        $k = test_kernel(ENV_ADMIN);
        api($k, 'GET', '/api/system/status');
        $config = $GLOBALS['kk_test_configs'][spl_object_id($k)];
        $config['admin']['password'] = 'ganz-anderes-pw';
        $changed = new KrautKompass\Core\Kernel($config);
        api($changed, 'GET', '/api/system/status');
        $old = api($changed, 'POST', '/api/auth/login', ['email' => 'carsten@kraut-kurier.de', 'password' => 'sehr-geheim-123']);
        assert_same(200, $old['status']);
        $count = $changed->container->get(KrautKompass\Core\Database\Database::class)->scalar('SELECT COUNT(*) FROM users');
        assert_same(1, (int) $count);
    },
];
