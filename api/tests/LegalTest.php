<?php

declare(strict_types=1);

// Anbieterangaben kommen aus der Server-.env und erscheinen nur vollständig im Status
return [
    'Impressum-Daten erscheinen erst mit Name und Anschrift' => static function (): void {
        [$k] = installed_kernel(['legal' => ['name' => 'Max Muster', 'street' => 'Weg 1', 'city' => null]]);
        $status = api($k, 'GET', '/api/system/status');
        assert_same([], (array) $status['json']['legal']);

        [$k] = installed_kernel(['legal' => [
            'name' => 'Max Muster', 'street' => 'Weg 1', 'city' => '12345 Musterstadt', 'email' => 'kein-mail', 'phone' => '',
        ]]);
        $legal = api($k, 'GET', '/api/system/status')['json']['legal'];
        assert_same(['name' => 'Max Muster', 'street' => 'Weg 1', 'city' => '12345 Musterstadt'], $legal);
    },
];
