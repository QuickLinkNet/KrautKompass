<?php

declare(strict_types=1);

namespace KrautKompass\Http\Middleware;

use Closure;
use KrautKompass\Core\Http\HttpException;
use KrautKompass\Core\Http\Request;
use KrautKompass\Core\Http\Response;
use KrautKompass\Core\Middleware;
use KrautKompass\Services\Auth;

/**
 * Lädt den angemeldeten Benutzer aus der Session und hängt ihn als Attribut 'user' an.
 */
final class AuthMiddleware implements Middleware
{
    public function __construct(private readonly Auth $auth)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $user = $this->auth->currentUser();
        if ($user === null) {
            throw HttpException::unauthorized();
        }
        $request->setAttribute('user', $user);
        return $next($request);
    }
}
