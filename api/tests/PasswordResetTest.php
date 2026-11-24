<?php

declare(strict_types=1);

use KrautKompass\Core\Kernel;
use KrautKompass\Services\Mailer;

const RESET_CONFIG = [
    'app' => ['url' => 'https://kompass.test'],
    'mail' => ['transport' => 'memory'],
];

/** Fordert einen Reset an und liefert den Token aus der (im Speicher) verschickten Mail. */
function request_reset_token(Kernel $k, string $email): string
{
    $res = api($k, 'POST', '/api/auth/password/forgot', ['email' => $email]);
    assert_same(202, $res['status'], json_encode($res['json']));
    $mail = end($k->container->get(Mailer::class)->sent);
    assert_true(is_array($mail), 'Es wurde keine Mail verschickt.');
    assert_true(preg_match('#https://kompass\.test/passwort-neu\?token=([a-f0-9]{64})#', $mail['body'], $m) === 1, 'Link fehlt.');
    return $m[1];
}

return [
    'Ohne Mailkonfiguration ist der Reset deaktiviert (503) und im Status abgeschaltet' => static function (): void {
        [$k] = installed_kernel();
        assert_same(false, api($k, 'GET', '/api/system/status')['json']['features']['passwordReset']);
        $res = api($k, 'POST', '/api/auth/password/forgot', ['email' => 'admin@test.de']);
        assert_same(503, $res['status']);
        assert_same('reset_unavailable', $res['json']['error']['code'] ?? $res['json']['code'] ?? null);
    },

    'Unbekannte E-Mail bekommt dieselbe Antwort, aber keine Mail' => static function (): void {
        [$k] = installed_kernel(RESET_CONFIG);
        assert_same(true, api($k, 'GET', '/api/system/status')['json']['features']['passwordReset']);
        api($k, 'POST', '/api/auth/logout');
        assert_same(202, api($k, 'POST', '/api/auth/password/forgot', ['email' => 'niemand@test.de'])['status']);
        assert_same([], $k->container->get(Mailer::class)->sent);
    },

    'Reset setzt das Passwort, beendet Sitzungen und ist nur einmal nutzbar' => static function (): void {
        [$k] = installed_kernel(RESET_CONFIG);
        $other = test_kernel_sharing_db($k);
        assert_same(200, api($other, 'POST', '/api/auth/login', ['email' => 'admin@test.de', 'password' => 'geheim-geheim'])['status']);

        $token = request_reset_token($k, 'admin@test.de');
        $stored = $k->container->get(KrautKompass\Core\Database\Database::class)->scalar('SELECT token_hash FROM password_resets');
        assert_same(hash('sha256', $token), $stored, 'Token darf nur gehasht gespeichert werden.');

        $res = api($k, 'POST', '/api/auth/password/reset', ['token' => $token, 'password' => 'ganz-neues-pw']);
        assert_same(200, $res['status'], json_encode($res['json']));
        assert_same(401, api($other, 'GET', '/api/auth/me')['status'], 'Andere Sitzung muss beendet sein.');

        $again = api($k, 'POST', '/api/auth/password/reset', ['token' => $token, 'password' => 'noch-ein-pw-1']);
        assert_same(422, $again['status']);
        api($k, 'POST', '/api/auth/logout');
        assert_same(401, api($k, 'POST', '/api/auth/login', ['email' => 'admin@test.de', 'password' => 'geheim-geheim'])['status']);
        assert_same(200, api($k, 'POST', '/api/auth/login', ['email' => 'admin@test.de', 'password' => 'ganz-neues-pw'])['status']);
    },

    'Abgelaufene, ältere und kaputte Tokens werden abgelehnt' => static function (): void {
        [$k] = installed_kernel(RESET_CONFIG);
        $first = request_reset_token($k, 'admin@test.de');
        $second = request_reset_token($k, 'admin@test.de');
        $body = static fn (string $t): array => ['token' => $t, 'password' => 'ganz-neues-pw'];
        assert_same(422, api($k, 'POST', '/api/auth/password/reset', $body($first))['status'], 'Älterer Token muss verfallen.');
        assert_same(422, api($k, 'POST', '/api/auth/password/reset', $body('abc'))['status']);

        $k->container->get(KrautKompass\Core\Database\Database::class)
            ->run("UPDATE password_resets SET expires_at = '2000-01-01T00:00:00Z'");
        assert_same(422, api($k, 'POST', '/api/auth/password/reset', $body($second))['status'], 'Abgelaufen.');
    },

    'Reset-Anfragen sind pro Adresse begrenzt' => static function (): void {
        [$k] = installed_kernel(RESET_CONFIG);
        for ($i = 0; $i < 3; $i++) {
            api($k, 'POST', '/api/auth/password/forgot', ['email' => 'admin@test.de']);
        }
        assert_same(429, api($k, 'POST', '/api/auth/password/forgot', ['email' => 'admin@test.de'])['status']);
    },
];
