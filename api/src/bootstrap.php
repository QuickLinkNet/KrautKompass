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
