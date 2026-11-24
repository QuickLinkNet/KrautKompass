<?php

declare(strict_types=1);

namespace KrautKompass\Core\Http;

final class Request
{
    /** @var array<string, string> Pfadparameter, vom Router gesetzt */
    private array $params = [];

    /** @var array<string, mixed> Attribute, die Middleware anhängt (z. B. user) */
    private array $attributes = [];

    /** @var array<string, mixed>|null */
    private ?array $json = null;

    /**
     * @param array<string, mixed> $query
     * @param array<string, string> $headers Schlüssel in Kleinbuchstaben
     */
    public function __construct(
        public readonly string $method,
        public readonly string $path,
        private readonly array $query = [],
        private readonly array $headers = [],
        private readonly string $body = '',
        public readonly string $ip = '0.0.0.0',
        public readonly bool $secure = false,
    ) {
    }

    /**
     * @param int $maxBodyBytes Es werden höchstens so viele Bytes (+1) gelesen;
     *                          der Kernel lehnt größere Bodies mit 413 ab.
     * @param bool $trustProxy  X-Forwarded-Proto/-For nur auswerten, wenn ein eigener
     *                          Reverse-Proxy davor sitzt (sonst fälschbar).
     */
    public static function fromGlobals(int $maxBodyBytes = 65536, bool $trustProxy = false): self
    {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $headers[strtolower(str_replace('_', '-', substr($key, 5)))] = (string) $value;
            }
        }
        if (isset($_SERVER['CONTENT_TYPE'])) {
            $headers['content-type'] = (string) $_SERVER['CONTENT_TYPE'];
        }

        $path = parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/';
        $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || ($trustProxy && ($headers['x-forwarded-proto'] ?? '') === 'https');
        $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
        if ($trustProxy && isset($headers['x-forwarded-for'])) {
            $ip = trim(explode(',', $headers['x-forwarded-for'])[0]);
        }

        $stream = fopen('php://input', 'rb');
        $body = $stream === false ? '' : (string) stream_get_contents($stream, $maxBodyBytes + 1);

        return new self(
            strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')),
            '/' . trim($path, '/'),
            $_GET,
            $headers,
            $body,
            $ip,
            $secure,
        );
    }

    public function bodySize(): int
    {
        return strlen($this->body);
    }

    public function isJson(): bool
    {
        return str_starts_with(strtolower((string) $this->header('content-type', '')), 'application/json');
    }

    public function header(string $name, ?string $default = null): ?string
    {
        return $this->headers[strtolower($name)] ?? $default;
    }

    public function query(string $key, mixed $default = null): mixed
    {
        return $this->query[$key] ?? $default;
    }

    /** @return array<string, mixed> */
    public function json(): array
    {
        if ($this->json === null) {
            $decoded = $this->body === '' ? [] : json_decode($this->body, true);
            if (!is_array($decoded)) {
                throw new HttpException(400, 'invalid_json', 'Der Request-Body ist kein gültiges JSON.');
            }
            $this->json = $decoded;
        }
        return $this->json;
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->json()[$key] ?? $default;
    }

    /** @param array<string, string> $params */
    public function withParams(array $params): self
    {
        $clone = clone $this;
        $clone->params = $params;
        return $clone;
    }

    public function param(string $key): string
    {
        return $this->params[$key] ?? '';
    }

    public function intParam(string $key): int
    {
        return (int) $this->param($key);
    }

    public function setAttribute(string $key, mixed $value): void
    {
        $this->attributes[$key] = $value;
    }

    public function attribute(string $key, mixed $default = null): mixed
    {
        return $this->attributes[$key] ?? $default;
    }
}
