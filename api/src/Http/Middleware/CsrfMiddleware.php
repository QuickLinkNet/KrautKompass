<?php

declare(strict_types=1);

namespace KrautKompass\Http\Middleware;

use Closure;
use KrautKompass\Core\Http\HttpException;
use KrautKompass\Core\Http\Request;
use KrautKompass\Core\Http\Response;
use KrautKompass\Core\Middleware;
use KrautKompass\Core\Session;

/**
 * Alle schreibenden Requests brauchen den Header X-CSRF-Token.
 * Das Token liefert GET /api/system/status.
 */
final class CsrfMiddleware implements Middleware
{
    public function __construct(private readonly Session $session)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $safe = in_array($request->method, ['GET', 'HEAD', 'OPTIONS'], true);
        if (!$safe && !$this->session->validCsrf($request->header('x-csrf-token'))) {
            throw new HttpException(419, 'csrf_mismatch', 'Sitzung abgelaufen. Bitte Seite neu laden.');
        }
        return $next($request);
    }
}
