<?php

declare(strict_types=1);

namespace KrautKompass\Domain\Settings;

use KrautKompass\Core\Database\Database;
use KrautKompass\Support\Clock;

/**
 * Schlüssel/Wert-Einstellungen der Instanz (z. B. installed_at, instance_name).
 */
final class SettingsRepository
{
    public function __construct(private readonly Database $db)
    {
    }

    public function get(string $key, ?string $default = null): ?string
    {
        $value = $this->db->scalar('SELECT value FROM settings WHERE key = ?', [$key]);
        return $value === null ? $default : (string) $value;
    }

    public function set(string $key, string $value): void
    {
        $this->db->run(
            'INSERT INTO settings (key, value, updated_at) VALUES (:key, :value, :now)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
            ['key' => $key, 'value' => $value, 'now' => Clock::now()],
        );
    }
}
