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

    /** PUT /api/products/{id}/rating – eigene Bewertung anlegen oder ändern */
    public function upsert(Request $request): Response
    {
        $productId = $request->intParam('id');
        if ($this->products->find($productId) === null) {
            throw HttpException::notFound('Sorte nicht gefunden.');
        }
        $max = $this->config->int('ratings.scale_max');
        $methods = implode(',', array_keys($this->config->array('ratings.methods')));
        $input = Validator::validate($request->json(), [
            'overall' => "required|int|min:1|max:$max",
            'taste' => "int|min:1|max:$max",
            'aroma' => "int|min:1|max:$max",
            'effect' => "int|min:1|max:$max",
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

        $userId = $this->userId($request);
        $this->ratings->upsert($userId, $productId, $input);
        $row = $this->ratings->findForUser($userId, $productId);
        return $this->json(['rating' => $row === null ? null : $this->presenter->present($row, $userId)]);
    }

    public function destroy(Request $request): Response
    {
        if (!$this->ratings->delete($this->userId($request), $request->intParam('id'))) {
            throw HttpException::notFound('Keine Bewertung vorhanden.');
        }
        return Response::noContent();
    }

    public function mine(Request $request): Response
    {
        $userId = $this->userId($request);
        return $this->json(['items' => $this->presentAll($this->ratings->byUser($userId), $userId)]);
    }

    public function feed(Request $request): Response
    {
        $userId = $this->userId($request);
        $limit = min(100, max(1, (int) $request->query('limit', 30)));
        return $this->json(['items' => $this->presentAll($this->ratings->feed($userId, $limit), $userId)]);
    }

    /**
     * @param list<array<string, mixed>> $rows
     * @return list<array<string, mixed>>
     */
    private function presentAll(array $rows, int $viewer): array
    {
        return array_map(fn (array $r): array => $this->presenter->present($r, $viewer), $rows);
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
