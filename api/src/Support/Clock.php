<?php

declare(strict_types=1);

namespace KrautKompass\Support;

/**
 * Einheitliches Zeitformat (ISO 8601, UTC) für alle Zeitstempel in der Datenbank.
 */
final class Clock
{
    public static function now(): string
    {
        return gmdate('Y-m-d\TH:i:s\Z');
    }

    public static function inDays(int $days): string
    {
        return gmdate('Y-m-d\TH:i:s\Z', time() + $days * 86400);
    }

    public static function inMinutes(int $minutes): string
    {
        return gmdate('Y-m-d\TH:i:s\Z', time() + $minutes * 60);
    }

    public static function minutesAgo(int $minutes): string
    {
        return gmdate('Y-m-d\TH:i:s\Z', time() - $minutes * 60);
    }
}
