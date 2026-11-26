<?php

declare(strict_types=1);

namespace KrautKompass\Services\Sync;

use KrautKompass\Core\Config;
use KrautKompass\Support\HttpClient;
use RuntimeException;

/**
 * Liest den Katalog des Kraut-Kurier-Shops (Cannaleo-White-Label, Next.js).
 *
 * Stand 26.11.2026 (Shop-Umbau, die alte /api/products gibt 404):
 *  - Liste:  GET /api/v1/shop/products?avail=1&category=flower&page=N&pageSize=24
 *            → data.data[] mit Stammdaten (nur lieferbare Sorten), data.meta.pagination.
 *            Größere Seiten als 24 lehnt der Shop mit HTTP 400 ab.
 *  - Detail: GET /product/<slug> → <script id="__NEXT_DATA__"> → props.pageProps.pageContext.product
 *            → Beschreibung, Terpene, Herkunft, Preis, Bild-URL
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
        $all = [];
        $page = 1;
        do {
            $query = http_build_query([
                'avail' => 1,
                'category' => 'flower',
                'page' => $page,
                'pageSize' => $size,
            ]);
            $json = $this->decode($this->http->get("$base/api/v1/shop/products?$query"), 'Produktliste');
            $result = $json['data'] ?? null;
            if (!is_array($result) || !isset($result['data']) || !is_array($result['data'])) {
                throw new RuntimeException('Produktliste: unerwartetes Format (Cannaleo hat evtl. etwas geändert).');
            }
            array_push($all, ...$result['data']);
            $pageCount = (int) ($result['meta']['pagination']['pageCount'] ?? 1);
            $page++;
        } while ($page <= $pageCount);
        return $all;
    }

    /** @return array<string, mixed>|null Produkt aus __NEXT_DATA__ oder null, wenn nicht gefunden */
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
        $product = $data['props']['pageProps']['pageContext']['product'] ?? null;
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
