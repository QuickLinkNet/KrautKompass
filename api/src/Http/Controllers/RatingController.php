<?php

declare(strict_types=1);

namespace KrautKompass\Http\Controllers;

use KrautKompass\Core\Config;
use KrautKompass\Core\Controller;
use KrautKompass\Core\Http\HttpException;
use KrautKompass\Core\Http\Request;
use KrautKompass\Core\Http\Response;
use KrautKompass\Core\Validator;
use KrautKompass\Domain\Products\ProductRepository;
use KrautKompass\Domain\Ratings\RatingPresenter;
use KrautKompass\Domain\Ratings\RatingRepository;

final class RatingController extends Controller
{
    public function __construct(
        private readonly RatingRepository $ratings,
        private readonly RatingPresenter $presenter,
        private readonly ProductRepository $products,
        private readonly Config $config,
    ) {
    }

    /** POST /api/products/{id}/ratings – neue Bewertung (mehrere pro Sorte möglich, Tagebuch) */
    public function store(Request $request): Response
    {
        $productId = $request->intParam('id');
        if ($this->products->find($productId) === null) {
            throw HttpException::notFound('Sorte nicht gefunden.');
        }
        $userId = $this->userId($request);
        $id = $this->ratings->create($userId, $productId, $this->validated($request));
        return $this->json(['rating' => $this->presentOne($id, $userId)], 201);
    }

    /** PUT /api/ratings/{id} – eigene Bewertung ändern */
    public function update(Request $request): Response
    {
        $userId = $this->userId($request);
        $id = $request->intParam('id');
        if (!$this->ratings->update($id, $userId, $this->validated($request))) {
            throw HttpException::notFound('Bewertung nicht gefunden.');
        }
        return $this->json(['rating' => $this->presentOne($id, $userId)]);
    }

    /** DELETE /api/ratings/{id} – eigene Bewertung löschen */
    public function destroy(Request $request): Response
    {
        if (!$this->ratings->delete($request->intParam('id'), $this->userId($request))) {
            throw HttpException::notFound('Bewertung nicht gefunden.');
        }
        return Response::noContent();
    }

    public function mine(Request $request): Response
    {
        $userId = $this->userId($request);
        return $this->json(['items' => $this->presentAll($this->ratings->byUser($userId), $userId)]);
    }

    /** GET /api/ratings/feed?limit&offset&author&favorites – nur geteilte Bewertungen */
    public function feed(Request $request): Response
    {
        $userId = $this->userId($request);
        $limit = min(100, max(1, (int) $request->query('limit', 30)));
        $offset = max(0, (int) $request->query('offset', 0));
        $author = (int) $request->query('author', 0);
        // Einen mehr laden, um zu wissen, ob es ältere gibt
        $rows = $this->ratings->feed($userId, $limit + 1, $offset, $author > 0 ? $author : null, $request->query('favorites') === '1');
        return $this->json([
            'items' => $this->presentAll(array_slice($rows, 0, $limit), $userId),
            'hasMore' => count($rows) > $limit,
            'authors' => $this->ratings->feedAuthors(),
        ]);
    }

    /**
     * @param list<array<string, mixed>> $rows
     * @return list<array<string, mixed>>
     */
    private function presentAll(array $rows, int $viewer): array
    {
        return array_map(fn (array $r): array => $this->presenter->present($r, $viewer), $rows);
    }

    /** @return array<string, mixed> */
    private function presentOne(int $id, int $viewer): array
    {
        $row = $this->ratings->find($id);
        if ($row === null) {
            throw HttpException::notFound('Bewertung nicht gefunden.');
        }
        return $this->presenter->present($row, $viewer);
    }

    /** @return array<string, mixed> geprüfte Felder einer Bewertung */
    private function validated(Request $request): array
    {
        $max = $this->config->int('ratings.scale_max');
        $methods = implode(',', array_keys($this->config->array('ratings.methods')));
        $input = Validator::validate($request->json(), [
            'overall' => "required|int|min:1|max:$max",
            'taste' => "int|min:1|max:$max",
            'aroma' => "int|min:1|max:$max",
            'effect' => "int|min:1|max:$max",
            'quality' => "int|min:1|max:$max",
            'again' => 'string|in:yes,maybe,no',
            'effects' => 'array|max:12',
            'side_effects' => 'array|max:12',
            'method' => "string|in:$methods",
            'notes' => 'string|max:4000',
            'visibility' => 'required|in:private,group',
            'consumed_at' => 'string|max:10',
        ]);
        $input['effects'] = $this->onlyKnown($input['effects'], 'ratings.effects', 'effects');
        $input['side_effects'] = $this->onlyKnown($input['side_effects'], 'ratings.side_effects', 'side_effects');
        if ($input['consumed_at'] !== null && !self::validDate((string) $input['consumed_at'])) {
            throw HttpException::validation(['consumed_at' => 'Gültiges Datum im Format JJJJ-MM-TT, nicht in der Zukunft.']);
        }
        return $input;
    }

    private static function validDate(string $date): bool
    {
        if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $date, $m) || !checkdate((int) $m[2], (int) $m[3], (int) $m[1])) {
            return false;
        }
        return $date <= date('Y-m-d', time() + 86400); // ein Tag Puffer für Zeitzonen
    }

    /** @return list<string> */
    private function onlyKnown(mixed $values, string $configKey, string $field): array
    {
        $values = is_array($values) ? array_values(array_unique(array_map('strval', $values))) : [];
        $unknown = array_diff($values, array_keys($this->config->array($configKey)));
        if ($unknown !== []) {
            throw HttpException::validation([$field => 'Unbekannte Werte: ' . implode(', ', $unknown)]);
        }
        return $values;
    }
}
