<?php

declare(strict_types=1);

/**
 * Standard-Konfiguration. Überschreiben in config/local.php (siehe local.example.php),
 * diese Datei wird nicht eingecheckt.
 */
return [
    'app' => [
        'name' => 'KrautKompass',
        'version' => '0.1.0',
        'debug' => false,
        'timezone' => 'Europe/Berlin',
    ],

    'paths' => [
        'storage' => KK_ROOT . '/storage',
        'database' => KK_ROOT . '/storage/database.sqlite',
        'sessions' => KK_ROOT . '/storage/sessions',
        'logs' => KK_ROOT . '/storage/logs',
        'migrations' => KK_ROOT . '/database/migrations',
        'media' => KK_ROOT . '/public/media',
        'media_url' => '/media',
    ],

    'session' => [
        'name' => 'kk_session',
        'lifetime_days' => 30,
    ],

    'security' => [
        'password_min_length' => 10,
        'login_max_attempts' => 5,
        'login_window_minutes' => 15,
        'invite_valid_days' => 14,
        'max_body_bytes' => 65536,
        // Nur auf true setzen, wenn ein eigener Reverse-Proxy (z. B. Cloudflare) davor sitzt.
        'trust_proxy' => false,
    ],

    // Produktquelle: Cannaleo-White-Label-Shop von Kraut Kurier
    'sync' => [
        'source' => 'krautkurier',
        'base_url' => 'https://krautkurier.shop',
        'vendor_id' => 139,
        'page_size' => 50,
        'request_delay_ms' => 250,
        'download_images' => true,
        'user_agent' => 'KrautKompass-Sync/0.1 (+privates Bewertungsprojekt)',
        // Bilder werden nur von diesen Hosts geladen (HTTPS) und landen im Webroot.
        'image_hosts' => ['cannaleo.fra1.digitaloceanspaces.com', 'cdn-cannaleo.fra1.digitaloceanspaces.com'],
        'max_image_bytes' => 8 * 1024 * 1024,
    ],

    // Bewertungs-Vokabular, wird dem Frontend über /api/meta ausgeliefert
    'ratings' => [
        'scale_max' => 10,
        'effects' => [
            'entspannend' => 'Entspannend',
            'beruhigend' => 'Beruhigend',
            'schlaffoerdernd' => 'Schlaffördernd',
            'euphorisch' => 'Euphorisch',
            'gluecklich' => 'Glücklich',
            'kreativ' => 'Kreativ',
            'fokussiert' => 'Fokussiert',
            'energetisch' => 'Energetisch',
            'gespraechig' => 'Gesprächig',
            'hungrig' => 'Appetitanregend',
            'schmerzlindernd' => 'Schmerzlindernd',
            'koerperlich' => 'Körperlich (Body High)',
        ],
        'side_effects' => [
            'trockener_mund' => 'Trockener Mund',
            'trockene_augen' => 'Trockene Augen',
            'kopfschmerz' => 'Kopfschmerzen',
            'unruhe' => 'Unruhe',
            'paranoia' => 'Paranoia',
            'schwindel' => 'Schwindel',
            'muedigkeit' => 'Müdigkeit',
        ],
        'methods' => [
            'vaporizer' => 'Vaporizer',
            'joint' => 'Joint',
            'bong' => 'Bong',
            'pfeife' => 'Pfeife',
            'edible' => 'Essbar',
            'sonstiges' => 'Sonstiges',
        ],
    ],
];
