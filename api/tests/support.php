<?php

declare(strict_types=1);

use KrautKompass\Core\Http\Request;
use KrautKompass\Core\Kernel;
use KrautKompass\Domain\Products\ProductRepository;

function assert_same(mixed $expected, mixed $actual, string $message = ''): void
{
    if ($expected !== $actual) {
        throw new RuntimeException(trim($message . ' Erwartet ' . var_export($expected, true)
            . ', erhalten ' . var_export($actual, true)));
    }
}

function assert_true(bool $condition, string $message = 'Bedingung nicht erfüllt.'): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

function assert_throws(callable $fn, string $exceptionClass, string $message = ''): Throwable
{
    try {
        $fn();
    } catch (Throwable $e) {
        if ($e instanceof $exceptionClass) {
            return $e;
        }
        throw new RuntimeException("$message Falsche Exception: " . $e::class . ' – ' . $e->getMessage());
    }
    throw new RuntimeException("$message Keine $exceptionClass geworfen.");
}

/**
 * Kernel mit frischem, temporärem Storage (eigene SQLite-Datei pro Test).
 * @param array<string, mixed> $overrides zusätzliche Konfiguration
 */
function test_kernel(array $overrides = []): Kernel
{
    $dir = sys_get_temp_dir() . '/kk-test-' . bin2hex(random_bytes(4));
    $config = array_replace_recursive(kk_config(), [
        // Unabhängig von einer lokalen config/local.php: kein Mailversand, keine öffentliche URL
        'app' => ['debug' => true, 'url' => null],
        'mail' => ['transport' => 'none'],
        'admin' => ['email' => null, 'password' => null],
        'paths' => [
            'storage' => $dir,
            'database' => $dir . '/test.sqlite',
            'sessions' => $dir . '/sessions',
            'logs' => $dir . '/logs',
            'media' => $dir . '/media',
        ],
        'sync' => ['request_delay_ms' => 0],
    ], $overrides);
    $kernel = new Kernel($config);
    $GLOBALS['kk_test_configs'][spl_object_id($kernel)] = $config;
    return $kernel;
}

/** Zweiter Kernel auf derselben Datenbank = eine weitere, unabhängige Sitzung (z. B. anderes Gerät). */
function test_kernel_sharing_db(Kernel $kernel): Kernel
{
    $config = $GLOBALS['kk_test_configs'][spl_object_id($kernel)];
    $second = new Kernel($config);
    $GLOBALS['kk_test_configs'][spl_object_id($second)] = $config;
    return $second;
}


/**
 * Simulierter API-Aufruf. Setzt automatisch das CSRF-Token der (In-Memory-)Session.
 * @param array<string, mixed>|null $body
 * @param array<string, mixed> $query
 * @return array{status: int, json: mixed}
 */
function api(Kernel $kernel, string $method, string $path, ?array $body = null, array $query = [], bool $csrf = true): array
{
    $headers = ['content-type' => 'application/json'];
    if ($csrf) {
        $headers['x-csrf-token'] = $kernel->container->get(KrautKompass\Core\Session::class)->csrfToken();
    }
    $request = new Request($method, $path, $query, $headers, $body === null ? '' : (string) json_encode($body), '127.0.0.1');
    $response = $kernel->handle($request);
    return ['status' => $response->status, 'json' => json_decode($response->body, true)];
}

/**
 * Richtet eine frische Instanz mit Admin ein und legt eine Sorte an.
 * @param array<string, mixed> $overrides
 */
function installed_kernel(array $overrides = []): array
{
    $k = test_kernel($overrides);
    $res = api($k, 'POST', '/api/system/install', [
        'instance_name' => 'Test', 'display_name' => 'Carsten', 'email' => 'admin@test.de', 'password' => 'geheim-geheim',
    ]);
    assert_same(201, $res['status'], json_encode($res['json']));
    $productId = $k->container->get(ProductRepository::class)->upsert('krautkurier', '4866', [
        'slug' => 'luana', 'name' => 'Luana 28/1 LMO Larrys GMO', 'producer' => 'Cannamedical',
        'genetic' => 'Hybrid', 'thc' => 28.0, 'terpenes' => '["Pinene","Limonen"]', 'available' => 1,
    ]);
    return [$k, $productId];
}

function invite_and_register(Kernel $k, string $name, string $email): void
{
    $code = api($k, 'POST', '/api/admin/invites', ['note' => $name])['json']['invite']['code'];
    api($k, 'POST', '/api/auth/logout');
    $res = api($k, 'POST', '/api/auth/register', [
        'invite_code' => $code, 'display_name' => $name, 'email' => $email, 'password' => 'passwort-123',
    ]);
    assert_same(201, $res['status'], json_encode($res['json']));
}
