<?php

declare(strict_types=1);

namespace KrautKompass\Services\Sync;

use KrautKompass\Core\Config;
use RuntimeException;

/**
 * Speichert Produktbilder lokal unter public/media/products/, damit die App nicht
 * vom Shop-CDN abhängt. Gibt Pfade relativ zu public/media zurück.
 *
 * Gehärtet, weil die Dateien im Webroot landen:
 *  - nur HTTPS-URLs von freigegebenen Hosts (sync.image_hosts)
 *  - Inhalt muss ein echtes Bild sein (Signatur-Prüfung); die Endung kommt aus dem
 *    erkannten Typ, nie aus der URL
 *  - Dateiname nur aus [a-z0-9-], atomares Schreiben über eine Temp-Datei
 */
class ImageStore
{
    private const TYPES = [
        IMAGETYPE_PNG => 'png',
        IMAGETYPE_JPEG => 'jpg',
        IMAGETYPE_WEBP => 'webp',
        IMAGETYPE_GIF => 'gif',
    ];

    private const VARIANTS = ['image', 'thumb'];

    public function __construct(private readonly Config $config)
    {
    }

    public function isAllowedUrl(string $url): bool
    {
        $parts = parse_url($url);
        return is_array($parts)
            && ($parts['scheme'] ?? '') === 'https'
            && in_array(strtolower($parts['host'] ?? ''), $this->config->array('sync.image_hosts'), true);
    }

    public function store(string $productSlug, string $variant, string $remoteUrl, string $bytes): string
    {
        if (!$this->isAllowedUrl($remoteUrl)) {
            throw new RuntimeException("Bild-Host nicht freigegeben: $remoteUrl");
        }
        if (!in_array($variant, self::VARIANTS, true)) {
            throw new RuntimeException("Unbekannte Bildvariante: $variant");
        }
        if (strlen($bytes) > $this->config->int('sync.max_image_bytes')) {
            throw new RuntimeException('Bild zu groß.');
        }
        $info = @getimagesizefromstring($bytes);
        $ext = is_array($info) ? (self::TYPES[$info[2]] ?? null) : null;
        if ($ext === null) {
            throw new RuntimeException("Kein gültiges Bild: $remoteUrl");
        }

        $safeSlug = trim((string) preg_replace('/[^a-z0-9-]+/', '-', strtolower($productSlug)), '-') ?: 'produkt';
        $relative = "products/{$safeSlug}-{$variant}.{$ext}";
        $target = $this->config->string('paths.media') . '/' . $relative;
        $dir = dirname($target);
        if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
            throw new RuntimeException("Verzeichnis nicht anlegbar: $dir");
        }
        $tmp = $target . '.tmp-' . bin2hex(random_bytes(4));
        if (file_put_contents($tmp, $bytes, LOCK_EX) === false || !rename($tmp, $target)) {
            @unlink($tmp);
            throw new RuntimeException("Bild konnte nicht gespeichert werden: $relative");
        }
        return $relative;
    }
}
