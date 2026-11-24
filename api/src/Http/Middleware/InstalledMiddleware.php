<?php

declare(strict_types=1);

namespace KrautKompass\Http\Middleware;

use Closure;
use KrautKompass\Core\Http\HttpException;
use KrautKompass\Core\Http\Request;
use KrautKompass\Core\Http\Response;
use KrautKompass\Core\Middleware;
use KrautKompass\Services\Installer;

/**
 * Sperrt alle fachlichen Endpunkte, solange der Einrichtungsassistent nicht abgeschlossen ist.
 */
final class InstalledMiddleware implements Middleware
{
    public function __construct(private readonly Installer $installer)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        if (!$this->installer->isInstalled()) {
            throw new HttpException(409, 'not_installed', 'KrautKompass ist noch nicht eingerichtet.');
        }
        return $next($request);
    }
}
