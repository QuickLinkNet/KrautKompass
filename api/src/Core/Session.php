<?php

declare(strict_types=1);

namespace KrautKompass\Core;

/**
 * Cookie-Session mit sicheren Defaults (HttpOnly, SameSite=Lax, Secure bei HTTPS),
 * eigenem Speicherort unter storage/ und CSRF-Token.
 * Im CLI- und Testbetrieb arbeitet sie rein im Speicher.
 */
final class Session
{
    private bool $started = false;

    /** @var array<string, mixed> Fallback ohne PHP-Session (CLI/Tests) */
    private array $memory = [];

    public function __construct(private readonly Config $config)
    {
    }

    public function start(bool $secure): void
    {
        if ($this->started || PHP_SAPI === 'cli') {
            $this->started = true;
            return;
        }
        $path = $this->config->string('paths.sessions');
        if (!is_dir($path)) {
            mkdir($path, 0775, true);
        }
        $lifetime = $this->config->int('session.lifetime_days') * 86400;
        session_save_path($path);
        session_name($this->config->string('session.name'));
        ini_set('session.gc_maxlifetime', (string) $lifetime);
        ini_set('session.use_strict_mode', '1');
        session_set_cookie_params([
            'lifetime' => $lifetime,
            'path' => '/',
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
        $this->started = true;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->store()[$key] ?? $default;
    }

    public function set(string $key, mixed $value): void
    {
        if ($this->usesPhpSession()) {
            $_SESSION[$key] = $value;
            return;
        }
        $this->memory[$key] = $value;
    }

    /** Neue Session-ID nach Login, gegen Session-Fixation. */
    public function regenerate(): void
    {
        if ($this->usesPhpSession()) {
            session_regenerate_id(true);
        }
        $this->set('csrf', bin2hex(random_bytes(32)));
    }

    public function destroy(): void
    {
        if ($this->usesPhpSession()) {
            $_SESSION = [];
            session_regenerate_id(true);
        }
        $this->memory = [];
    }

    public function csrfToken(): string
    {
        $token = $this->get('csrf');
        if (!is_string($token) || $token === '') {
            $token = bin2hex(random_bytes(32));
            $this->set('csrf', $token);
        }
        return $token;
    }

    public function validCsrf(?string $token): bool
    {
        return is_string($token) && $token !== '' && hash_equals($this->csrfToken(), $token);
    }

    private function usesPhpSession(): bool
    {
        return session_status() === PHP_SESSION_ACTIVE;
    }

    /** @return array<string, mixed> */
    private function store(): array
    {
        return $this->usesPhpSession() ? $_SESSION : $this->memory;
    }
}
