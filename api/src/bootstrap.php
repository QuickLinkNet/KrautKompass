<?php

declare(strict_types=1);

/**
 * Gemeinsamer Einstiegspunkt für Web (public/index.php), CLI (bin/console) und Tests.
 * Registriert den PSR-4-Autoloader und liefert die zusammengeführte Konfiguration.
 */

const KK_ROOT = __DIR__ . '/..';

spl_autoload_register(static function (string $class): void {
    $prefix = 'KrautKompass\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }
    $relative = str_replace('\\', '/', substr($class, strlen($prefix)));
    $file = __DIR__ . '/' . $relative . '.php';
    if (is_file($file)) {
        require $file;
    }
});

/**
 * Server-Werte aus Umgebungsvariablen oder api/.env (KEY=VALUE, # Kommentare).
 * Echte Umgebungsvariablen haben Vorrang. Leere Werte gelten als nicht gesetzt.
 */
function kk_env(string $key, ?string $default = null): ?string
{
    static $file = null;
    if ($file === null) {
        $file = [];
        $path = KK_ROOT . '/.env';
        foreach (is_file($path) ? (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: []) : [] as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) {
                continue;
            }
            [$name, $value] = array_map('trim', explode('=', $line, 2));
            if (strlen($value) >= 2 && ($value[0] === '"' || $value[0] === "'") && $value[-1] === $value[0]) {
                $value = substr($value, 1, -1);
            }
            $file[$name] = $value;
        }
    }
    $value = getenv($key);
    if (!is_string($value) || $value === '') {
        $value = $file[$key] ?? '';
    }
    return $value === '' ? $default : $value;
}

/**
 * @return array<string, mixed>
 */
function kk_config(): array
{
    static $config = null;
    if ($config === null) {
        $config = require KK_ROOT . '/config/app.php';
        $local = KK_ROOT . '/config/local.php';
        if (is_file($local)) {
            $config = array_replace_recursive($config, require $local);
        }
    }
    return $config;
}
