<?php

declare(strict_types=1);

namespace KrautKompass\Core;

use KrautKompass\Core\Http\HttpException;
use KrautKompass\Core\Http\Request;
use KrautKompass\Core\Http\Response;

/**
 * Basis für Controller. Controller werden vom Container gebaut, Abhängigkeiten
 * (Repositories, Services) kommen also einfach über den Konstruktor.
 */
abstract class Controller
{
    protected function json(mixed $data, int $status = 200): Response
    {
        return Response::json($data, $status);
    }

    /** @return array<string, mixed> der angemeldete Benutzer (von AuthMiddleware gesetzt) */
    protected function user(Request $request): array
    {
        $user = $request->attribute('user');
        if (!is_array($user)) {
            throw HttpException::unauthorized();
        }
        return $user;
    }

    protected function userId(Request $request): int
    {
        return (int) $this->user($request)['id'];
    }
}
