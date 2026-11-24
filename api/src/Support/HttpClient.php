<?php

declare(strict_types=1);

namespace KrautKompass\Support;

use RuntimeException;

/**
 * Abhängigkeitsfreier HTTP-GET-Client: nutzt cURL, falls vorhanden, sonst Streams.
 * Gehärtet: nur HTTPS (auch bei Weiterleitungen), TLS-Prüfung immer an,
 * Antwortgröße begrenzt.
 */
class HttpClient
{
    public function __construct(
        private readonly string $userAgent = 'KrautKompass',
        private readonly int $timeout = 20,
        private readonly int $maxBytes = 10 * 1024 * 1024,
    ) {
    }

    /** @return array{status: int, body: string} */
    public function get(string $url): array
    {
        if (!str_starts_with(strtolower($url), 'https://')) {
            throw new RuntimeException("Nur HTTPS erlaubt: $url");
        }
        return function_exists('curl_init') ? $this->viaCurl($url) : $this->viaStream($url);
    }

    /** @return array{status: int, body: string} */
    private function viaCurl(string $url): array
    {
        $ch = curl_init($url);
        $body = '';
        $tooLarge = false;
        curl_setopt_array($ch, [
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
            CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTPS,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_USERAGENT => $this->userAgent,
            CURLOPT_ENCODING => '',
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            // Stream mit Größenlimit statt alles in den Speicher zu laden
            CURLOPT_WRITEFUNCTION => function ($ch, string $chunk) use (&$body, &$tooLarge): int {
                if (strlen($body) + strlen($chunk) > $this->maxBytes) {
                    $tooLarge = true;
                    return 0; // bricht den Transfer ab
                }
                $body .= $chunk;
                return strlen($chunk);
            },
        ]);
        // Windows-PHP bringt oft kein CA-Bündel mit: dann den System-Zertifikatsspeicher nutzen.
        if (PHP_OS_FAMILY === 'Windows' && !ini_get('curl.cainfo') && defined('CURLSSLOPT_NATIVE_CA')) {
            curl_setopt($ch, CURLOPT_SSL_OPTIONS, CURLSSLOPT_NATIVE_CA);
        }
        $ok = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        if ($tooLarge) {
            throw new RuntimeException("Antwort größer als {$this->maxBytes} Bytes: $url");
        }
        if ($ok === false) {
            throw new RuntimeException("HTTP-Fehler bei $url: $error");
        }
        return ['status' => $status, 'body' => $body];
    }

    /** @return array{status: int, body: string} */
    private function viaStream(string $url): array
    {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => $this->timeout,
                'header' => 'User-Agent: ' . $this->userAgent . "\r\n",
                'ignore_errors' => true,
                'max_redirects' => 3,
            ],
            'ssl' => ['verify_peer' => true, 'verify_peer_name' => true],
        ]);
        $body = @file_get_contents($url, false, $context, 0, $this->maxBytes + 1);
        if ($body === false) {
            throw new RuntimeException("HTTP-Fehler bei $url");
        }
        if (strlen($body) > $this->maxBytes) {
            throw new RuntimeException("Antwort größer als {$this->maxBytes} Bytes: $url");
        }
        $status = 0;
        foreach ($http_response_header ?? [] as $line) {
            if (preg_match('#^HTTP/\S+\s+(\d{3})#', $line, $m)) {
                $status = (int) $m[1];
            }
        }
        return ['status' => $status, 'body' => $body];
    }
}
