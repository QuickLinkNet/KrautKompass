<?php

declare(strict_types=1);

namespace KrautKompass\Services;

use KrautKompass\Core\Config;
use KrautKompass\Core\Database\Database;
use KrautKompass\Core\Http\HttpException;
use KrautKompass\Core\Logger;
use KrautKompass\Core\Session;
use KrautKompass\Domain\Invites\InviteRepository;
use KrautKompass\Domain\Users\UserRepository;
use KrautKompass\Support\Clock;

/**
 * Login/Logout per Session, Registrierung nur mit gültigem Einladungscode.
 *
 * Härtung:
 *  - Drosselung pro Konto (login_attempts) und pro IP (RateLimiter)
 *  - konstante Laufzeit auch bei unbekannter E-Mail (keine Konto-Erkennung über Timing)
 *  - Session-Version: Passwortwechsel oder Deaktivierung beendet alle anderen Sitzungen
 */
final class Auth
{
    /** Gültiger Hash eines Zufallswerts, nur für den Timing-Ausgleich. */
    private ?string $dummyHash = null;

    public function __construct(
        private readonly Session $session,
        private readonly UserRepository $users,
        private readonly InviteRepository $invites,
        private readonly PasswordHasher $hasher,
        private readonly RateLimiter $limiter,
        private readonly Database $db,
        private readonly Config $config,
        private readonly Logger $logger,
    ) {
    }

    /**
     * Bewusst ohne Zwischenspeicher: Jede Prüfung liest Status und Session-Version
     * frisch aus der Datenbank (auch unter langlebigen Prozessen korrekt).
     *
     * @return array<string, mixed>|null
     */
    public function currentUser(): ?array
    {
        $id = $this->session->get('user_id');
        if (!is_int($id)) {
            return null;
        }
        $user = $this->users->find($id);
        $valid = $user !== null
            && $user['status'] === 'active'
            && $this->users->sessionVersion($id) === (int) $this->session->get('session_version');
        if (!$valid) {
            $this->session->destroy();
            return null;
        }
        return $user;
    }

    /** @return array<string, mixed> */
    public function attempt(string $email, string $password, string $ip): array
    {
        $this->limiter->hit("login-ip:$ip", 30, 15);
        $this->guardAccountThrottle($email);

        $row = $this->users->findForLogin($email);
        $hash = $row === null ? $this->dummyHash() : (string) $row['password_hash'];
        $passwordOk = $this->hasher->verify($password, $hash);

        if ($row === null || !$passwordOk) {
            $this->db->insert('login_attempts', ['ip' => $ip, 'email' => $email, 'attempted_at' => Clock::now()]);
            $this->logger->info('login_failed', ['email' => $email, 'ip' => $ip]);
            throw new HttpException(401, 'invalid_credentials', 'E-Mail oder Passwort ist falsch.');
        }
        if ($row['status'] !== 'active') {
            throw HttpException::forbidden('Dieses Konto ist deaktiviert.');
        }
        if ($this->hasher->needsRehash((string) $row['password_hash'])) {
            $this->users->update((int) $row['id'], ['password_hash' => $this->hasher->hash($password)]);
        }
        $this->db->run('DELETE FROM login_attempts WHERE email = ?', [$email]);
        return $this->loginById((int) $row['id']);
    }

    /**
     * @param array{email: string, display_name: string, password: string, invite_code: string} $data
     * @return array<string, mixed>
     */
    public function register(array $data, string $ip): array
    {
        $this->limiter->hit("register-ip:$ip", 10, 60);
        $userId = $this->db->transaction(function () use ($data): int {
            $invite = $this->invites->findRedeemable($data['invite_code']);
            if ($invite === null) {
                throw HttpException::validation(['invite_code' => 'Einladung ungültig, abgelaufen oder schon benutzt.']);
            }
            if ($this->users->emailExists($data['email'])) {
                throw HttpException::validation(['email' => 'Diese E-Mail-Adresse ist schon registriert.']);
            }
            $id = $this->users->create(
                $data['email'],
                $data['display_name'],
                $this->hasher->hash($data['password']),
                (string) $invite['role'],
            );
            if (!$this->invites->markUsed((int) $invite['id'], $id)) {
                throw HttpException::validation(['invite_code' => 'Einladung wurde gerade schon benutzt.']);
            }
            return $id;
        });
        $this->logger->info('user_registered', ['user_id' => $userId]);
        return $this->loginById($userId);
    }

    /** @return array<string, mixed> */
    public function loginById(int $id): array
    {
        $version = $this->users->sessionVersion($id) ?? throw HttpException::unauthorized();
        $this->session->regenerate();
        $this->session->set('user_id', $id);
        $this->session->set('session_version', $version);
        $this->users->touchLogin($id);
        return $this->currentUser() ?? throw HttpException::unauthorized();
    }

    /** Beendet alle Sitzungen des Benutzers; die aktuelle bleibt auf Wunsch bestehen. */
    public function invalidateSessions(int $userId, bool $keepCurrent): void
    {
        $this->users->bumpSessionVersion($userId);
        if ($keepCurrent && $this->session->get('user_id') === $userId) {
            $this->session->set('session_version', $this->users->sessionVersion($userId) ?? 0);
        }
    }

    public function logout(): void
    {
        $this->session->destroy();
    }

    private function guardAccountThrottle(string $email): void
    {
        $window = $this->config->int('security.login_window_minutes');
        $this->db->run('DELETE FROM login_attempts WHERE attempted_at < ?', [Clock::minutesAgo($window)]);
        // Bewusst pro Konto (über alle IPs), damit verteiltes Raten nicht hilft.
        $failed = (int) $this->db->scalar('SELECT COUNT(*) FROM login_attempts WHERE email = ?', [$email]);
        if ($failed >= $this->config->int('security.login_max_attempts')) {
            $this->logger->info('login_throttled', ['email' => $email]);
            throw new HttpException(429, 'too_many_attempts', "Zu viele Fehlversuche. Bitte $window Minuten warten.");
        }
    }

    private function dummyHash(): string
    {
        return $this->dummyHash ??= $this->hasher->hash(bin2hex(random_bytes(16)));
    }
}
