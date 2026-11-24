<?php

declare(strict_types=1);

/**
 * Kopieren nach config/local.php und nur die Werte eintragen, die abweichen.
 * Wird rekursiv über config/app.php gelegt.
 */
return [
    'app' => [
        'debug' => true,
        // 'url' => 'https://kompass.red-it.org',
    ],
    // Passwort-Reset per Mail (auf dem Webspace über PHP mail()):
    // 'mail' => ['transport' => 'mail', 'from' => 'kompass@red-it.org'],
    // Lokal ohne Mailserver: Mails landen im Log (storage/logs), nur mit debug = true.
    // 'mail' => ['transport' => 'log'],
    // 'legal' => ['imprint_url' => 'https://…/impressum', 'privacy_url' => 'https://…/datenschutz'],
    // 'sync' => ['download_images' => false],
];
