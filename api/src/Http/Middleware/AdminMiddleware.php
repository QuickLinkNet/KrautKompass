<?php

declare(strict_types=1);

namespace KrautKompass\Http\Middleware;

use Closure;
use KrautKompass\Core\Http\HttpException;
use KrautKompass\Core\Http\Request;
use KrautKompass\Core\Http\Response;
use KrautKompass\Core\Middleware;

/**
 * Nur für Admins (Carsten bzw. die Person, die das System eingerichtet hat).
 * Muss nach 'auth' laufen.
 */
final class AdminMiddleware implements Middleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->attribute('user');
        if (!is_array($user) || ($user['role'] ?? '') !== 'admin') {
            throw HttpException::forbidden('Nur für Admins.');
        }
        return $next($request);
    }
}
