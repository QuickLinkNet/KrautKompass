<?php

declare(strict_types=1);

namespace KrautKompass\Http\Controllers\Admin;

use KrautKompass\Core\Config;
use KrautKompass\Core\Controller;
use KrautKompass\Core\Http\HttpException;
use KrautKompass\Core\Http\Request;
use KrautKompass\Core\Http\Response;
use KrautKompass\Core\Validator;
use KrautKompass\Domain\Invites\InviteRepository;
use KrautKompass\Core\Database\Database;
use KrautKompass\Domain\Users\UserRepository;
use KrautKompass\Services\Auth;

/**
 * Benutzer- und Einladungsverwaltung für Admins.
 */
final class UserAdminController extends Controller
{
    public function __construct(
        private readonly UserRepository $users,
        private readonly InviteRepository $invites,
        private readonly Config $config,
        private readonly Database $db,
        private readonly Auth $auth,
    ) {
    }

    public function users(Request $request): Response
    {
        return $this->json(['items' => $this->users->all()]);
    }

    /** PATCH /api/admin/users/{id} – Rolle oder Status ändern */
    public function updateUser(Request $request): Response
    {
        $id = $request->intParam('id');
        $input = Validator::validate($request->json(), [
            'role' => 'in:admin,member',
            'status' => 'in:active,disabled',
        ]);
        $changes = array_filter($input, static fn (mixed $v): bool => $v !== null);
        // In einer Schreibtransaktion, damit sich zwei Admins nicht gleichzeitig entmachten.
        $this->db->transaction(function () use ($id, $changes): void {
            $target = $this->users->find($id) ?? throw HttpException::notFound('Benutzer nicht gefunden.');
            $demotesAdmin = $target['role'] === 'admin' && $target['status'] === 'active'
                && (($changes['role'] ?? 'admin') !== 'admin' || ($changes['status'] ?? 'active') !== 'active');
            if ($demotesAdmin && $this->users->countAdmins() <= 1) {
                throw new HttpException(409, 'last_admin', 'Der letzte aktive Admin kann nicht herabgestuft werden.');
            }
            $this->users->update($id, $changes);
        });
        if ($changes !== []) {
            // Rechteänderung wirkt sofort: bestehende Sitzungen des Benutzers enden.
            $this->auth->invalidateSessions($id, $id === $this->userId($request));
        }
        return $this->json(['user' => $this->users->find($id)]);
    }

    public function invites(Request $request): Response
    {
        return $this->json(['items' => $this->invites->all()]);
    }

    public function createInvite(Request $request): Response
    {
        $input = Validator::validate($request->json(), [
            'role' => 'in:admin,member',
            'note' => 'string|max:120',
            'valid_days' => 'int|min:1|max:90',
        ]);
        $invite = $this->invites->create(
            (string) ($input['role'] ?? 'member'),
            $input['note'] === null ? null : (string) $input['note'],
            (int) ($input['valid_days'] ?? $this->config->int('security.invite_valid_days')),
            $this->userId($request),
        );
        return $this->json(['invite' => $invite], 201);
    }

    public function revokeInvite(Request $request): Response
    {
        if (!$this->invites->revoke($request->intParam('id'))) {
            throw new HttpException(409, 'invite_not_revocable', 'Einladung ist schon benutzt oder widerrufen.');
        }
        return Response::noContent();
    }
}
