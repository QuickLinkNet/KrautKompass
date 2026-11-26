<?php

declare(strict_types=1);

use KrautKompass\Core\Database\Database;

// Bewertung: Blütenqualität (Skala wie die übrigen Einzelwerte) und „Würdest du sie wieder nehmen?“.
return static function (Database $db): void {
    $db->run('ALTER TABLE ratings ADD COLUMN quality INTEGER CHECK (quality BETWEEN 1 AND 10)');
    $db->run("ALTER TABLE ratings ADD COLUMN again TEXT CHECK (again IN ('yes', 'maybe', 'no'))");
};
