<?php

declare(strict_types=1);

/**
 * Standard-Konfiguration. Server-Werte kommen aus api/.env (siehe .env.example),
 * alles Weitere lässt sich in config/local.php überschreiben (siehe local.example.php).
 * Beide Dateien werden nicht eingecheckt.
 */
return [
    'app' => [
        'name' => 'KrautKompass',
        'version' => '0.1.0',
        'debug' => kk_env('APP_DEBUG') === 'true',
        'timezone' => 'Europe/Berlin',
        // Öffentliche Adresse ohne Slash am Ende, z. B. https://krautkompass.red-it.org.
        // Wird für Links in E-Mails gebraucht (nie aus dem Host-Header abgeleitet).
        'url' => kk_env('APP_URL'),
    ],

    // Erster Admin: wird beim ersten Aufruf angelegt, solange es noch keinen gibt.
    // Ist er gesetzt, ist der Einrichtungsassistent im Browser gesperrt.
    'admin' => [
        'email' => kk_env('ADMIN_EMAIL'),
        'password' => kk_env('ADMIN_PASSWORD'),
        'name' => kk_env('ADMIN_NAME', 'Admin'),
        'instance_name' => kk_env('INSTANCE_NAME', 'KrautKompass'),
    ],

    // Optionale Rechtstexte; werden unter den Auth-Seiten verlinkt, sobald gesetzt.
    'legal' => [
        'imprint_url' => kk_env('IMPRINT_URL'),
        'privacy_url' => kk_env('PRIVACY_URL'),
    ],

    // Mailversand (Passwort-Reset). Ohne Konfiguration ist der Reset deaktiviert.
    // transport: none | mail (PHP mail()) | log (nur Entwicklung, schreibt ins Log)
    'mail' => [
        'transport' => kk_env('MAIL_TRANSPORT', 'none'),
        'from' => kk_env('MAIL_FROM'),
        'from_name' => 'KrautKompass',
    ],

    'paths' => [
        'storage' => KK_ROOT . '/storage',
        'database' => KK_ROOT . '/storage/database.sqlite',
        'sessions' => KK_ROOT . '/storage/sessions',
        'logs' => KK_ROOT . '/storage/logs',
        'migrations' => KK_ROOT . '/database/migrations',
        'media' => KK_ROOT . '/public/media',
        'media_url' => kk_base_path() . '/media',
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
        'reset_valid_minutes' => 60,
        'max_body_bytes' => 65536,
        // Nur auf true setzen, wenn ein eigener Reverse-Proxy (z. B. Cloudflare) davor sitzt.
        'trust_proxy' => false,
    ],

    // Produktquelle: Cannaleo-White-Label-Shop von Kraut Kurier
    'sync' => [
        'source' => 'krautkurier',
        'base_url' => 'https://krautkurier.shop',
        'page_size' => 24, // Maximum der Shop-Schnittstelle
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
