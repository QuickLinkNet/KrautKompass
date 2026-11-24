<?php

declare(strict_types=1);

use KrautKompass\Core\Http\HttpException;
use KrautKompass\Core\Http\Request;
use KrautKompass\Core\Validator;
use KrautKompass\Domain\Invites\InviteRepository;
use KrautKompass\Domain\Sync\SyncRunRepository;
use KrautKompass\Services\Sync\ImageStore;

// Tests für die Härtungsmaßnahmen (Teil 2 der Architektur)
return [
    'Zu großer Body wird mit 413 abgelehnt' => static function (): void {
        [$k] = installed_kernel();
        $big = ['notes' => str_repeat('x', 70000)];
        assert_same(413, api($k, 'POST', '/api/auth/logout', $big)['status']);
    },

    'Body ohne JSON-Content-Type wird mit 415 abgelehnt' => static function (): void {
        [$k] = installed_kernel();
        $token = $k->container->get(KrautKompass\Core\Session::class)->csrfToken();
        $request = new Request('POST', '/api/auth/logout', [], [
            'content-type' => 'application/x-www-form-urlencoded', 'x-csrf-token' => $token,
        ], 'a=b');
        assert_same(415, $k->handle($request)->status);
    },

    'Listen oder Objekte in Textfeldern werden abgelehnt' => static function (): void {
        $e = assert_throws(static fn () => Validator::validate(
            ['role' => ['admin'], 'name' => ['x' => 1], 'tags' => [['verschachtelt']]],
            ['role' => 'in:admin,member', 'name' => 'string', 'tags' => 'array'],
        ), HttpException::class);
        assert_same(['role', 'name', 'tags'], array_keys($e->details['fields']));
    },

    'Passwörter werden nicht getrimmt, Tippfehler in Regeln fallen auf' => static function (): void {
        assert_same(['pw' => ' geheim '], Validator::validate(['pw' => ' geheim '], ['pw' => 'raw|string']));
        assert_throws(static fn () => Validator::validate(['a' => 'x'], ['a' => 'strng']), LogicException::class);
    },

    'Einladungscode-Prüfung ist pro IP begrenzt' => static function (): void {
        [$k] = installed_kernel();
        api($k, 'POST', '/api/auth/logout');
        for ($i = 0; $i < 30; $i++) {
            api($k, 'GET', '/api/invites/KK-AAAA-AAAA');
        }
        assert_same(429, api($k, 'GET', '/api/invites/KK-AAAA-AAAA')['status']);
    },

    'Eine Einladung lässt sich nicht doppelt einlösen' => static function (): void {
        [$k] = installed_kernel();
        $repo = $k->container->get(InviteRepository::class);
        $invite = $repo->create('member', null, 7, null);
        assert_true($repo->markUsed((int) $invite['id'], 1));
        assert_true(!$repo->markUsed((int) $invite['id'], 1), 'Zweites Einlösen muss scheitern.');
    },

    'Deaktivieren beendet die Sitzung sofort' => static function (): void {
        [$k] = installed_kernel();
        invite_and_register($k, 'Freundin', 'f@test.de');
        $member = api($k, 'GET', '/api/auth/me')['json']['user'];
        // Admin (in einer zweiten Sitzung) deaktiviert das Mitglied
        $admin = test_kernel_sharing_db($k);
        api($admin, 'POST', '/api/auth/login', ['email' => 'admin@test.de', 'password' => 'geheim-geheim']);
        assert_same(200, api($admin, 'PATCH', "/api/admin/users/{$member['id']}", ['status' => 'disabled'])['status']);
        assert_same(401, api($k, 'GET', '/api/auth/me')['status']);
    },

    'Passwortwechsel meldet andere Sitzungen ab, die eigene bleibt' => static function (): void {
        [$k] = installed_kernel();
        $other = test_kernel_sharing_db($k);
        api($other, 'POST', '/api/auth/login', ['email' => 'admin@test.de', 'password' => 'geheim-geheim']);
        assert_same(200, api($other, 'GET', '/api/auth/me')['status']);
        $res = api($k, 'PATCH', '/api/auth/me', ['current_password' => 'geheim-geheim', 'new_password' => 'neues-passwort-1']);
        assert_same(200, $res['status'], json_encode($res['json']));
        assert_same(200, api($k, 'GET', '/api/auth/me')['status']);
        assert_same(401, api($other, 'GET', '/api/auth/me')['status']);
    },

    'Bildspeicher akzeptiert nur echte Bilder von freigegebenen Hosts' => static function (): void {
        [$k] = installed_kernel();
        $store = $k->container->get(ImageStore::class);
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
        $ok = 'https://cannaleo.fra1.digitaloceanspaces.com/cannaleo_apo/x.jpg';
        assert_same('products/test-thumb.png', $store->store('Test', 'thumb', $ok, $png), 'Endung kommt aus dem Inhalt.');
        assert_throws(static fn () => $store->store('t', 'image', 'https://evil.example/x.png', $png), RuntimeException::class);
        assert_throws(static fn () => $store->store('t', 'image', $ok, '<?php echo 1;'), RuntimeException::class);
        assert_throws(static fn () => $store->store('t', '../x', $ok, $png), RuntimeException::class);
    },

    'Sync-Läufe starten nie doppelt, hängende Läufe werden aufgeräumt' => static function (): void {
        [$k] = installed_kernel();
        $runs = $k->container->get(SyncRunRepository::class);
        $first = $runs->tryStart('krautkurier', 'test');
        assert_true($first !== null);
        assert_same(null, $runs->tryStart('krautkurier', 'test'));
        $k->container->get(KrautKompass\Core\Database\Database::class)
            ->run("UPDATE sync_runs SET started_at = '2000-01-01T00:00:00Z' WHERE id = ?", [$first]);
        assert_true($runs->tryStart('krautkurier', 'test') !== null, 'Hängender Lauf darf nicht blockieren.');
    },

];
