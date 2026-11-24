<?php

declare(strict_types=1);

namespace KrautKompass\Http\Controllers;

use KrautKompass\Core\Config;
use KrautKompass\Core\Controller;
use KrautKompass\Core\Http\HttpException;
use KrautKompass\Core\Http\Request;
use KrautKompass\Core\Http\Response;
use KrautKompass\Core\Session;
use KrautKompass\Core\Validator;
use KrautKompass\Domain\Invites\InviteRepository;
use KrautKompass\Domain\Users\UserRepository;
use KrautKompass\Services\Auth;
use KrautKompass\Services\PasswordHasher;
use KrautKompass\Services\RateLimiter;

final class AuthController extends Controller
{
    public function __construct(
        private readonly Auth $auth,
        private readonly Session $session,
        private readonly Config $config,
        private readonly InviteRepository $invites,
        private readonly UserRepository $users,
        private readonly PasswordHasher $hasher,
        private readonly RateLimiter $limiter,
    ) {
    }

    public function login(Request $request): Response
    {
        $input = Validator::validate($request->json(), [
            'email' => 'required|email|max:120',
            'password' => 'required|raw|string|max:200',
        ]);
        $user = $this->auth->attempt((string) $input['email'], (string) $input['password'], $request->ip);
        return $this->json(['user' => $user, 'csrfToken' => $this->session->csrfToken()]);
    }

    public function logout(Request $request): Response
    {
        $this->auth->logout();
        return $this->json(['csrfToken' => $this->session->csrfToken()]);
    }

    public function me(Request $request): Response
    {
        return $this->json(['user' => $this->user($request)]);
    }

    /** Prüft einen Einladungscode, bevor das Registrierungsformular gezeigt wird. */
    public function checkInvite(Request $request): Response
    {
        $this->limiter->hit('invite-check:' . $request->ip, 30, 60);
        $invite = $this->invites->findRedeemable($request->param('code'));
        if ($invite === null) {
            throw HttpException::notFound('Einladung ungültig, abgelaufen oder schon benutzt.');
        }
        return $this->json(['valid' => true, 'expiresAt' => $invite['expires_at']]);
    }

    public function register(Request $request): Response
    {
        $min = $this->config->int('security.password_min_length');
        $input = Validator::validate($request->json(), [
            'invite_code' => 'required|string|max:20',
            'display_name' => 'required|string|min:2|max:40',
            'email' => 'required|email|max:120',
            'password' => "required|raw|string|min:$min|max:200",
        ]);
        /** @var array{email: string, display_name: string, password: string, invite_code: string} $input */
        $user = $this->auth->register($input, $request->ip);
        return $this->json(['user' => $user, 'csrfToken' => $this->session->csrfToken()], 201);
    }

    public function updateProfile(Request $request): Response
    {
        $min = $this->config->int('security.password_min_length');
        $input = Validator::validate($request->json(), [
            'display_name' => 'string|min:2|max:40',
            'current_password' => 'raw|string|max:200',
            'new_password' => "raw|string|min:$min|max:200",
        ]);
        $changes = [];
        if ($input['display_name'] !== null) {
            $changes['display_name'] = $input['display_name'];
        }
        if ($input['new_password'] !== null) {
            $this->limiter->hit('password-change:' . $this->userId($request), 5, 15);
            $row = $this->users->findForLogin((string) $this->user($request)['email']);
            if ($row === null || !$this->hasher->verify((string) $input['current_password'], (string) $row['password_hash'])) {
                throw HttpException::validation(['current_password' => 'Aktuelles Passwort stimmt nicht.']);
            }
            $changes['password_hash'] = $this->hasher->hash((string) $input['new_password']);
        }
        $this->users->update($this->userId($request), $changes);
        if (isset($changes['password_hash'])) {
            // Alle anderen Geräte abmelden, diese Sitzung bleibt bestehen.
            $this->auth->invalidateSessions($this->userId($request), true);
        }
        return $this->json(['user' => $this->users->find($this->userId($request))]);
    }
}
