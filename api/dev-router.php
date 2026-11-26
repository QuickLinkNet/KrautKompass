<?php

declare(strict_types=1);

/*
 * Router für den PHP-Entwicklungsserver (ersetzt .htaccess lokal):
 *   php -S 127.0.0.1:8095 -t public dev-router.php
 * /api → index.php, vorhandene Dateien direkt, sonst index.html (falls gebaut).
 */
$path = parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/';
$public = __DIR__ . '/public';

if (preg_match('#^/api(/|$)#', $path)) {
    require $public . '/index.php';
    return true;
}
if ($path !== '/' && is_file($public . $path)) {
    // Typen, die der eingebaute PHP-Server nicht kennt, und kein Cache für Service Worker/Manifest
    if (preg_match('#/(sw\.js|manifest\.webmanifest)$#', $path)) {
        header('Content-Type: ' . (str_ends_with($path, '.js') ? 'text/javascript' : 'application/manifest+json'));
        header('Cache-Control: no-cache');
        readfile($public . $path);
        return true;
    }
    return false;
}
if (is_file($public . '/index.html')) {
    // Gleiche CSP wie in .htaccess, damit der Build lokal realistisch getestet wird.
    header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
        . "font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
    header('Content-Type: text/html; charset=utf-8');
    readfile($public . '/index.html');
    return true;
}
http_response_code(404);
echo 'Frontend nicht gebaut. Im Dev-Betrieb http://localhost:5220 (Vite) öffnen.';
return true;
