<?php

declare(strict_types=1);

namespace KrautKompass\Services\Sync;

use Closure;
use KrautKompass\Core\Config;
use KrautKompass\Core\Http\HttpException;
use KrautKompass\Domain\Products\ProductRepository;
use KrautKompass\Domain\Sync\SyncRunRepository;
use KrautKompass\Support\Clock;
use Throwable;

/**
 * Gleicht den lokalen Katalog mit dem Shop ab. Inkrementell: Detailseiten und Bilder
 * werden nur geladen, wenn ein Produkt neu ist oder sich im Shop geändert hat.
 * Fehler bei einzelnen Produkten brechen den Lauf nicht ab, sie landen in den Stats.
 */
final class ProductSync
{
    public function __construct(
        private readonly Config $config,
        private readonly CannaleoClient $client,
        private readonly ImageStore $images,
        private readonly ProductRepository $products,
        private readonly SyncRunRepository $runs,
    ) {
    }

    /**
     * @param Closure(string): void|null $progress optionale Ausgabe (CLI)
     * @return array<string, mixed> Stats des Laufs
     */
    public function run(string $trigger, bool $force = false, ?Closure $progress = null): array
    {
        $source = $this->config->string('sync.source');
        $runId = $this->runs->tryStart($source, $trigger)
            ?? throw new HttpException(409, 'sync_running', 'Es läuft bereits ein Abgleich.');
        @set_time_limit(600);
        $log = $progress ?? static function (string $line): void {
        };
        $stats = ['listed' => 0, 'created' => 0, 'updated' => 0, 'details' => 0,
            'images' => 0, 'deactivated' => 0, 'errors' => []];

        try {
            $items = $this->client->listProducts();
            $stats['listed'] = count($items);
            $log("{$stats['listed']} Produkte im Shop gefunden.");
            $seen = [];
            foreach ($items as $item) {
                if (!is_array($item) || !isset($item['id'], $item['url'], $item['name'])) {
                    $stats['errors'][] = 'Unvollständiger Listeneintrag übersprungen.';
                    continue;
                }
                $externalId = (string) $item['id'];
                $seen[] = $externalId;
                try {
                    $this->syncItem($source, $externalId, $item, $force, $stats, $log);
                } catch (Throwable $e) {
                    if (count($stats['errors']) < 25) {
                        $stats['errors'][] = ($item['name'] ?? $externalId) . ': ' . $e->getMessage();
                    }
                }
            }
            // Sicherung: Liefert der Shop plötzlich weniger als die Hälfte der bekannten
            // Sorten, ist eher die Schnittstelle kaputt als das Sortiment geschrumpft.
            $active = $this->products->countActive($source);
            if ($active > 0 && count($seen) < $active / 2) {
                $stats['errors'][] = 'Shop lieferte auffällig wenige Sorten – nichts deaktiviert.';
            } else {
                $stats['deactivated'] = $this->products->deactivateMissing($source, $seen);
            }
            $this->runs->finish($runId, 'success', $stats);
        } catch (Throwable $e) {
            $this->runs->finish($runId, 'failed', $stats, $e->getMessage());
            throw $e;
        }
        return $stats;
    }

    /**
     * @param array<string, mixed> $item
     * @param array<string, mixed> $stats
     * @param Closure(string): void $log
     */
    private function syncItem(string $source, string $externalId, array $item, bool $force, array &$stats, Closure $log): void
    {
        $existing = $this->products->findBySource($source, $externalId);
        $columns = ProductMapper::fromListItem($item);
        $needsDetails = $force
            || $existing === null
            || $existing['details_synced_at'] === null
            || $existing['source_updated_at'] !== $columns['source_updated_at'];

        $this->products->upsert($source, $externalId, $columns);
        $stats[$existing === null ? 'created' : 'updated']++;
        if (!$needsDetails) {
            return;
        }

        $this->pause();
        $details = $this->client->productDetails($columns['slug']);
        if ($details === null) {
            return;
        }
        $mapped = ProductMapper::fromDetails($details);
        $extra = $mapped['columns'] + ['details_synced_at' => Clock::now(), 'image_remote_url' => $mapped['image']];
        if ($this->config->bool('sync.download_images')) {
            $extra += $this->downloadImages($columns['slug'], $mapped, $stats);
        }
        $this->products->upsert($source, $externalId, $extra);
        $stats['details']++;
        $log("✓ {$columns['name']}");
    }

    /**
     * @param array{image: ?string, thumb: ?string} $mapped
     * @param array<string, mixed> $stats
     * @return array<string, string>
     */
    private function downloadImages(string $slug, array $mapped, array &$stats): array
    {
        $paths = [];
        foreach (['image' => 'image_path', 'thumb' => 'thumb_path'] as $variant => $column) {
            $url = $mapped[$variant];
            if ($url === null) {
                continue;
            }
            if (!$this->images->isAllowedUrl($url)) {
                $stats['errors'][] = "Bild von nicht freigegebenem Host übersprungen: $url";
                continue;
            }
            $this->pause();
            $paths[$column] = $this->images->store($slug, $variant, $url, $this->client->download($url));
            $stats['images']++;
        }
        return $paths;
    }

    private function pause(): void
    {
        $ms = $this->config->int('sync.request_delay_ms');
        if ($ms > 0) {
            usleep($ms * 1000);
        }
    }
}
