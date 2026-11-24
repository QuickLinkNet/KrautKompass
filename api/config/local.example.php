<?php

declare(strict_types=1);

/**
 * Kopieren nach config/local.php und nur die Werte eintragen, die abweichen.
 * Wird rekursiv über config/app.php gelegt.
 */
return [
    'app' => [
        'debug' => true,
    ],
    // 'sync' => ['download_images' => false],
];
