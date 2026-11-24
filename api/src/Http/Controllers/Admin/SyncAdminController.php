<?php

declare(strict_types=1);

namespace KrautKompass\Http\Controllers\Admin;

use KrautKompass\Core\Controller;
use KrautKompass\Core\Http\Request;
use KrautKompass\Core\Http\Response;
use KrautKompass\Domain\Sync\SyncRunRepository;
use KrautKompass\Services\Sync\ProductSync;

/**
 * Produktabgleich mit dem Shop: manuell auslösen und Protokoll ansehen.
 * Für regelmäßige Läufe: Cronjob mit `php bin/console products:sync`.
 */
final class SyncAdminController extends Controller
{
    public function __construct(
        private readonly ProductSync $sync,
        private readonly SyncRunRepository $runs,
    ) {
    }

    public function runs(Request $request): Response
    {
        return $this->json(['items' => $this->runs->latest()]);
    }

    public function start(Request $request): Response
    {
        $force = (bool) $request->input('force', false);
        session_write_close(); // Session nicht für die ganze Laufzeit sperren
        $stats = $this->sync->run('web', $force);
        return $this->json(['stats' => $stats]);
    }
}
