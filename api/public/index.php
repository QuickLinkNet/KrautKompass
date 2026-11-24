<?php

declare(strict_types=1);

/*
 * Front-Controller für /api/*. Alles andere liefert der Webserver als
 * statische Dateien bzw. index.html (Single-Page-App), siehe .htaccess.
 */
require __DIR__ . '/../src/bootstrap.php';

use KrautKompass\Core\Http\Request;
use KrautKompass\Core\Kernel;

Kernel::registerErrorHandling();

$config = kk_config();
$request = Request::fromGlobals(
    (int) $config['security']['max_body_bytes'],
    (bool) $config['security']['trust_proxy'],
);
(new Kernel($config))->handle($request)->send();
