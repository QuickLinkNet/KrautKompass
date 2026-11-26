<?php

declare(strict_types=1);

use KrautKompass\Core\Database\Database;

// Begrüßung nach dem ersten Login: einmal pro Konto (auch über Safari und installierte App hinweg).
return static function (Database $db): void {
    $db->run('ALTER TABLE users ADD COLUMN welcomed_at TEXT');
};
