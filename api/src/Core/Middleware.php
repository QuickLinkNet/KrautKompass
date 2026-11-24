<?php

declare(strict_types=1);

namespace KrautKompass\Core;

use Closure;
use KrautKompass\Core\Http\Request;
use KrautKompass\Core\Http\Response;

interface Middleware
{
    /** @param Closure(Request): Response $next */
    public function handle(Request $request, Closure $next): Response;
}
