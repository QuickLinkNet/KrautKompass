<?php

declare(strict_types=1);

namespace KrautKompass\Services;

use KrautKompass\Core\Config;
use KrautKompass\Core\Database\Database;
use KrautKompass\Core\Database\Migrator;
use KrautKompass\Core\Http\HttpException;
use KrautKompass\Domain\Settings\SettingsRepository;
use KrautKompass\Domain\Users\UserRepository;
use KrautKompass\Support\Clock;

/**
 * Selbstinstallation in zwei Stufen:
 *  1. prepare(): läuft bei jedem Request/CLI-Aufruf. Legt Verzeichnisse an,
 *     erstellt die SQLite-Datei und spielt ausstehende Migrationen ein.
 *  2. install(): einmalig über den Einrichtungsassistenten. Legt den ersten Admin an.
 */
final class Installer
{
    private const MEDIA_HTACCESS = <<<'HTACCESS'
        # Nur Bilder ausliefern, Skripte und HTML niemals (bewusst ohne Options/
        # RemoveHandler, die auf Shared Hosting oft nicht erlaubt sind)
        <FilesMatch "\.(?i:php\d?|phtml|phar|cgi|pl|py|sh|html?|svg)$">
            Require all denied
        </FilesMatch>
        <IfModule mod_headers.c>
            Header set X-Content-Type-Options "nosniff"
            Header set Content-Security-Policy "default-src 'none'"
        </IfModule>

        HTACCESS;

    private bool $prepared = false;

    public function __construct(
        private readonly Config $config,
        private readonly Database $db,
        private readonly SettingsRepository $settings,
        private readonly UserRepository $users,
        private readonly PasswordHasher $hasher,
    ) {
    }

    public function prepare(): void
    {
        if ($this->prepared) {
            return;
        }
        foreach (['paths.storage', 'paths.sessions', 'paths.logs', 'paths.media'] as $key) {
            $dir = $this->config->string($key);
            if (!is_dir($dir) && !@mkdir($dir, 0775, true) && !is_dir($dir)) {
                throw new \RuntimeException("Verzeichnis kann nicht angelegt werden: $dir");
            }
        }
        $this->protectStorage();
        (new Migrator($this->db, $this->config->string('paths.migrations')))->migrate();
        $this->prepared = true;
    }

    public function isInstalled(): bool
    {
        return $this->settings->get('installed_at') !== null;
    }

    /**
     * @param array{email: string, display_name: string, password: string} $admin
     * @return int ID des Admins
     */
    public function install(array $admin, string $instanceName): int
    {
        return $this->db->transaction(function () use ($admin, $instanceName): int {
            if ($this->isInstalled()) {
                throw new HttpException(409, 'already_installed', 'KrautKompass ist bereits eingerichtet.');
            }
            $id = $this->users->create(
                $admin['email'],
                $admin['display_name'],
                $this->hasher->hash($admin['password']),
                'admin',
            );
            $this->settings->set('instance_name', $instanceName);
            $this->settings->set('installed_at', Clock::now());
            return $id;
        });
    }

    /** Ist der erste Admin über die Server-Konfiguration (.env) vorgegeben? */
    public function adminFromConfig(): bool
    {
        return (string) $this->config->get('admin.email', '') !== '';
    }

    /**
     * Legt den Admin aus der Server-Konfiguration an, falls noch niemand eingerichtet ist.
     * @return string|null Fehlerbeschreibung, wenn die Vorgabe unbrauchbar ist
     */
    public function bootstrapAdmin(): ?string
    {
        if (!$this->adminFromConfig() || $this->isInstalled()) {
            return null;
        }
        $email = strtolower(trim((string) $this->config->get('admin.email')));
        $password = (string) $this->config->get('admin.password', '');
        $min = $this->config->int('security.password_min_length');
        if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            return 'ADMIN_EMAIL in der .env ist keine gültige E-Mail-Adresse.';
        }
        if (mb_strlen($password) < $min) {
            return "ADMIN_PASSWORD in der .env fehlt oder hat weniger als $min Zeichen.";
        }
        try {
            $this->install([
                'email' => $email,
                'display_name' => mb_substr(trim((string) $this->config->get('admin.name', 'Admin')), 0, 40) ?: 'Admin',
                'password' => $password,
            ], (string) $this->config->get('admin.instance_name', $this->config->string('app.name')));
        } catch (HttpException $e) {
            // Parallel schon eingerichtet – nichts zu tun.
        }
        return null;
    }

    /** @return list<array{key: string, label: string, ok: bool}> */
    public function requirements(): array
    {
        $storage = $this->config->string('paths.storage');
        $media = $this->config->string('paths.media');
        return [
            ['key' => 'php', 'label' => 'PHP 8.1 oder neuer (' . PHP_VERSION . ')', 'ok' => PHP_VERSION_ID >= 80100],
            ['key' => 'pdo_sqlite', 'label' => 'PDO SQLite', 'ok' => extension_loaded('pdo_sqlite')],
            ['key' => 'storage', 'label' => 'storage/ beschreibbar', 'ok' => is_writable($storage)],
            ['key' => 'media', 'label' => 'public/media/ beschreibbar', 'ok' => is_writable($media)],
            [
                'key' => 'http',
                'label' => 'Ausgehende HTTP-Requests (cURL oder allow_url_fopen) für den Produkt-Sync',
                'ok' => function_exists('curl_init') || (bool) ini_get('allow_url_fopen'),
            ],
        ];
    }

    /**
     * Zusätzlicher Schutz: storage/ komplett sperren (falls es doch im Webroot landet),
     * in media/ nur Bilder ausliefern und niemals Skripte ausführen.
     */
    private function protectStorage(): void
    {
        $rules = [
            $this->config->string('paths.storage') . '/.htaccess' => "Require all denied\n",
            $this->config->string('paths.media') . '/.htaccess' => self::MEDIA_HTACCESS,
        ];
        foreach ($rules as $file => $content) {
            if (!is_file($file)) {
                @file_put_contents($file, $content);
            }
        }
    }
}
