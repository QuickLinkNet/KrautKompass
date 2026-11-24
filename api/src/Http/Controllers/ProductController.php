<?php

declare(strict_types=1);

namespace KrautKompass\Http\Controllers;

use KrautKompass\Core\Controller;
use KrautKompass\Core\Http\HttpException;
use KrautKompass\Core\Http\Request;
use KrautKompass\Core\Http\Response;
use KrautKompass\Domain\Products\ProductPresenter;
use KrautKompass\Domain\Products\ProductRepository;
use KrautKompass\Domain\Ratings\RatingPresenter;
use KrautKompass\Domain\Ratings\RatingRepository;

final class ProductController extends Controller
{
    public function __construct(
        private readonly ProductRepository $products,
        private readonly ProductPresenter $presenter,
        private readonly RatingRepository $ratings,
        private readonly RatingPresenter $ratingPresenter,
    ) {
    }

    /** GET /api/products?q=&producer=&genetic=&terpene=&available=1&sort=name|thc|rating|newest&page=1 */
    public function index(Request $request): Response
    {
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(100, max(1, (int) $request->query('perPage', 24)));
        $result = $this->products->search([
            'q' => $this->stringQuery($request, 'q'),
            'producer' => $this->stringQuery($request, 'producer'),
            'genetic' => $this->stringQuery($request, 'genetic'),
            'terpene' => $this->stringQuery($request, 'terpene'),
            'available' => $request->query('available') === '1',
            'sort' => $this->stringQuery($request, 'sort'),
        ], $page, $perPage);

        return $this->json([
            'items' => array_map(fn (array $row): array => $this->presenter->present($row), $result['items']),
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
        return $this->json($this->products->facets());
    }

    public function show(Request $request): Response
    {
        $row = $this->products->find($request->intParam('id'));
        if ($row === null) {
            throw HttpException::notFound('Sorte nicht gefunden.');
        }
        $viewer = $this->userId($request);
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

    private function stringQuery(Request $request, string $key): ?string
    {
        $value = $request->query($key);
        return is_string($value) && trim($value) !== '' ? trim($value) : null;
    }
}
