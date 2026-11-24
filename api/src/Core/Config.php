<?php

declare(strict_types=1);

namespace KrautKompass\Core;

/**
 * Lesezugriff auf die Konfiguration per Punkt-Notation, z. B. get('sync.base_url').
 */
final class Config
{
    /** @param array<string, mixed> $values */
    public function __construct(private readonly array $values)
    {
    }

    public function get(string $key, mixed $default = null): mixed
    {
        $value = $this->values;
        foreach (explode('.', $key) as $segment) {
            if (!is_array($value) || !array_key_exists($segment, $value)) {
                return $default;
            }
            $value = $value[$segment];
        }
        return $value;
    }

    public function string(string $key): string
    {
        return (string) $this->get($key, '');
    }

    public function int(string $key): int
    {
        return (int) $this->get($key, 0);
    }

    public function bool(string $key): bool
    {
        return (bool) $this->get($key, false);
    }

    /** @return array<string, mixed> */
    public function array(string $key): array
    {
        $value = $this->get($key, []);
        return is_array($value) ? $value : [];
    }
}
