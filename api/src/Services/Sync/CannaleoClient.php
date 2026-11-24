<?php

declare(strict_types=1);

namespace KrautKompass\Services\Sync;

use KrautKompass\Core\Config;
use KrautKompass\Support\HttpClient;
use RuntimeException;

/**
 * Liest den Katalog des Kraut-Kurier-Shops (Cannaleo-White-Label, Next.js).
 *
 *  - Liste:  GET /api/products?pagination[page]=N&pagination[pageSize]=50&vend=<vendor>
 *            → message.data[] mit Stammdaten, message.meta.pagination
 *  - Detail: GET /product/<slug> → <script id="__NEXT_DATA__"> → props.pageProps.pageContext.product
 *            → Beschreibung, Terpene, Bild-URLs
 *
 * Inoffizielle Schnittstelle: ändert Cannaleo das Frontend, muss nur diese Klasse angepasst werden.
 */
class CannaleoClient
{
    private HttpClient $http;

    public function __construct(private readonly Config $config, ?HttpClient $http = null)
    {
        $this->http = $http ?? new HttpClient($config->string('sync.user_agent'));
    }

    /** @return list<array<string, mixed>> alle Produkte aus der Listen-API */
    public function listProducts(): array
    {
        $base = rtrim($this->config->string('sync.base_url'), '/');
        $size = $this->config->int('sync.page_size');
        $vendor = $this->config->int('sync.vendor_id');
        $all = [];
        $page = 1;
        do {
            $query = http_build_query([
                'pagination' => ['page' => $page, 'pageSize' => $size],
                'vend' => $vendor,
            ]);
            $json = $this->decode($this->http->get("$base/api/products?$query"), 'Produktliste');
            $message = $json['message'] ?? null;
            if (!is_array($message) || !isset($message['data']) || !is_array($message['data'])) {
                throw new RuntimeException('Produktliste: unerwartetes Format (Cannaleo hat evtl. etwas geändert).');
            }
            array_push($all, ...$message['data']);
            $pageCount = (int) ($message['meta']['pagination']['pageCount'] ?? 1);
            $page++;
        } while ($page <= $pageCount);
        return $all;
    }

    /** @return array<string, mixed>|null attributes des Produkts oder null, wenn nicht gefunden */
    public function productDetails(string $slug): ?array
    {
        $base = rtrim($this->config->string('sync.base_url'), '/');
        $response = $this->http->get("$base/product/" . rawurlencode($slug));
        if ($response['status'] === 404) {
            return null;
        }
        if (!preg_match('#<script id="__NEXT_DATA__"[^>]*>(.*?)</script>#s', $response['body'], $m)) {
            throw new RuntimeException("Detailseite $slug: keine __NEXT_DATA__ gefunden.");
        }
        $data = json_decode($m[1], true);
        $product = $data['props']['pageProps']['pageContext']['product']['attributes'] ?? null;
        return is_array($product) ? $product : null;
    }

    public function download(string $url): string
    {
        $response = $this->http->get($url);
        if ($response['status'] !== 200 || $response['body'] === '') {
            throw new RuntimeException("Bild-Download fehlgeschlagen ($response[status]): $url");
        }
        return $response['body'];
    }

    /**
     * @param array{status: int, body: string} $response
     * @return array<string, mixed>
     */
    private function decode(array $response, string $what): array
    {
        if ($response['status'] !== 200) {
            throw new RuntimeException("$what: HTTP $response[status]");
        }
        $json = json_decode($response['body'], true);
        if (!is_array($json) || !empty($json['error'])) {
            throw new RuntimeException("$what: Fehlerantwort vom Shop.");
        }
        return $json;
    }
}
