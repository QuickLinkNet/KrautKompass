<?php

declare(strict_types=1);

/*
 * Abhängigkeitsfreier Test-Runner:  php tests/run.php [Filter]
 * Jede Datei tests/*Test.php gibt ein Array 'Testname' => Closure zurück.
 */
require __DIR__ . '/../src/bootstrap.php';
require __DIR__ . '/support.php';

$filter = $argv[1] ?? '';
$passed = 0;
$failed = [];

foreach (glob(__DIR__ . '/*Test.php') ?: [] as $file) {
    $suite = basename($file, '.php');
    $tests = require $file;
    foreach ($tests as $name => $test) {
        $label = "$suite › $name";
        if ($filter !== '' && stripos($label, $filter) === false) {
            continue;
        }
        try {
            $test();
            $passed++;
            echo "  ✓ $label\n";
        } catch (Throwable $e) {
            $failed[] = $label;
            echo "  ✗ $label\n      " . $e->getMessage() . ' (' . basename($e->getFile()) . ':' . $e->getLine() . ")\n";
        }
    }
}

echo "\n$passed bestanden, " . count($failed) . " fehlgeschlagen\n";
exit($failed === [] ? 0 : 1);
