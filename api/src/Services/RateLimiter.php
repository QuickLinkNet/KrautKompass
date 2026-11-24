<?php

declare(strict_types=1);

namespace KrautKompass\Services;

use KrautKompass\Core\Database\Database;
use KrautKompass\Core\Http\HttpException;
use KrautKompass\Support\Clock;

/**
 * Gleitendes Zeitfenster pro Schlüssel (z. B. "register:203.0.113.5").
 * hit() zählt einen Versuch und wirft 429, sobald das Limit überschritten ist.
 */
final class RateLimiter
{
    public function __construct(private readonly Database $db)
    {
    }

    public function hit(string $key, int $max, int $windowMinutes): void
    {
        $since = Clock::minutesAgo($windowMinutes);
        $this->db->run('DELETE FROM rate_limits WHERE key = ? AND hit_at < ?', [$key, $since]);
        $count = (int) $this->db->scalar('SELECT COUNT(*) FROM rate_limits WHERE key = ?', [$key]);
        if ($count >= $max) {
            throw new HttpException(
                429,
                'rate_limited',
                "Zu viele Anfragen. Bitte in $windowMinutes Minuten erneut versuchen.",
            );
        }
        $this->db->insert('rate_limits', ['key' => $key, 'hit_at' => Clock::now()]);
    }

    /** Aufräumen alter Einträge (läuft gelegentlich mit). */
    public function prune(int $olderThanMinutes = 1440): void
    {
        $this->db->run('DELETE FROM rate_limits WHERE hit_at < ?', [Clock::minutesAgo($olderThanMinutes)]);
    }
}
