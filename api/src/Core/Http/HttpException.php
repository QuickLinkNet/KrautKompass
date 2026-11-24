<?php

declare(strict_types=1);

namespace KrautKompass\Core\Http;

use RuntimeException;

/**
 * Fachlicher Fehler, der vom Kernel in eine JSON-Fehlerantwort übersetzt wird.
 */
final class HttpException extends RuntimeException
{
    /** @param array<string, mixed> $details */
    public function __construct(
        public readonly int $status,
        public readonly string $errorCode,
        string $message,
        public readonly array $details = [],
    ) {
        parent::__construct($message, $status);
    }

    public static function notFound(string $message = 'Nicht gefunden.'): self
    {
        return new self(404, 'not_found', $message);
    }

    public static function forbidden(string $message = 'Keine Berechtigung.'): self
    {
        return new self(403, 'forbidden', $message);
    }

    public static function unauthorized(string $message = 'Bitte zuerst anmelden.'): self
    {
        return new self(401, 'unauthorized', $message);
    }

    /** @param array<string, string> $fields */
    public static function validation(array $fields): self
    {
        return new self(422, 'validation_failed', 'Bitte Eingaben prüfen.', ['fields' => $fields]);
    }
}
