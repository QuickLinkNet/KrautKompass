<?php

declare(strict_types=1);

namespace KrautKompass\Http\Controllers;

use KrautKompass\Core\Config;
use KrautKompass\Core\Controller;
use KrautKompass\Core\Http\HttpException;
use KrautKompass\Core\Http\Request;
use KrautKompass\Core\Http\Response;
use KrautKompass\Domain\Favorites\FavoriteRepository;
use KrautKompass\Domain\Products\ProductPresenter;
use KrautKompass\Domain\Products\ProductRepository;
use KrautKompass\Domain\Products\ProductStatsRepository;
use KrautKompass\Domain\Ratings\RatingPresenter;
use KrautKompass\Domain\Ratings\RatingRepository;

final class ProductController extends Controller
{
    public function __construct(
        private readonly Config $config,
        private readonly ProductRepository $products,
        private readonly ProductStatsRepository $stats,
        private readonly ProductPresenter $presenter,
        private readonly RatingRepository $ratings,
        private readonly RatingPresenter $ratingPresenter,
        private readonly FavoriteRepository $favorites,
    ) {
    }

    /**
     * GET /api/products?q=&producer=&genetic=&terpene=&thcMin=&thcMax=&cbdMin=&cbdMax=
     *     &minRating=&effects=a,b&available=1&favorites=1&sort=popular|rating|thc|thc_asc|newest|name&page=1
     */
    public function index(Request $request): Response
    {
        $viewer = $this->userId($request);
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(100, max(1, (int) $request->query('perPage', 24)));
        $knownEffects = array_keys($this->config->array('ratings.effects'));
        $effects = array_values(array_intersect(
            explode(',', (string) $this->stringQuery($request, 'effects')),
            $knownEffects,
        ));
        $result = $this->products->search([
            'q' => $this->stringQuery($request, 'q'),
            'producer' => $this->stringQuery($request, 'producer'),
            'genetic' => $this->stringQuery($request, 'genetic'),
            'terpene' => $this->stringQuery($request, 'terpene'),
            'thcMin' => $this->numberQuery($request, 'thcMin'),
            'thcMax' => $this->numberQuery($request, 'thcMax'),
            'cbdMin' => $this->numberQuery($request, 'cbdMin'),
            'cbdMax' => $this->numberQuery($request, 'cbdMax'),
            'minRating' => $this->numberQuery($request, 'minRating'),
            'effects' => $effects,
            'available' => $request->query('available') === '1',
            'favorites' => $request->query('favorites') === '1',
            'sort' => $this->stringQuery($request, 'sort'),
        ], $viewer, $page, $perPage);

        $topEffects = $this->stats->topEffects(array_map(static fn (array $r): int => (int) $r['id'], $result['items']));
        return $this->json([
            'items' => array_map(
                fn (array $row): array => $this->presenter->present($row) + ['topEffects' => $topEffects[(int) $row['id']] ?? []],
                $result['items'],
            ),
            'pagination' => [
                'page' => $page,
                'perPage' => $perPage,
                'total' => $result['total'],
                'pageCount' => (int) ceil($result['total'] / $perPage),
            ],
        ]);
    }

    public function facets(Request $request): Response
    {
        return $this->json($this->stats->facets());
    }

    public function show(Request $request): Response
    {
        $viewer = $this->userId($request);
        $row = $this->products->find($request->intParam('id'), $viewer);
        if ($row === null) {
            throw HttpException::notFound('Sorte nicht gefunden.');
        }
        $ratings = array_map(
            fn (array $r): array => $this->ratingPresenter->present($r, $viewer),
            $this->ratings->visibleForProduct((int) $row['id'], $viewer),
        );
        $mine = array_values(array_filter($ratings, static fn (array $r): bool => $r['isMine']));

        return $this->json([
            'product' => $this->presenter->present($row, true),
            'myRating' => $mine[0] ?? null,
            'ratings' => $ratings,
        ]);
    }

    /** PUT /api/products/{id}/favorite – auf die Merkliste */
    public function favorite(Request $request): Response
    {
        $id = $this->existingProductId($request);
        $this->favorites->add($this->userId($request), $id);
        return $this->json(['favorite' => true]);
    }

    /** DELETE /api/products/{id}/favorite – von der Merkliste */
    public function unfavorite(Request $request): Response
    {
        $id = $this->existingProductId($request);
        $this->favorites->remove($this->userId($request), $id);
        return $this->json(['favorite' => false]);
    }

    private function existingProductId(Request $request): int
    {
        $row = $this->products->find($request->intParam('id'));
        if ($row === null || !(bool) $row['active']) {
            throw HttpException::notFound('Sorte nicht gefunden.');
        }
        return (int) $row['id'];
    }

    private function stringQuery(Request $request, string $key): ?string
    {
        $value = $request->query($key);
        return is_string($value) && trim($value) !== '' ? mb_substr(trim($value), 0, 100) : null;
    }

    private function numberQuery(Request $request, string $key): ?float
    {
        $value = $this->stringQuery($request, $key);
        if ($value === null || !is_numeric(str_replace(',', '.', $value))) {
            return null;
        }
        return max(0.0, min(100.0, (float) str_replace(',', '.', $value)));
    }
}
