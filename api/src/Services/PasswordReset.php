<?php

declare(strict_types=1);

namespace KrautKompass\Services;

use KrautKompass\Core\Config;
use KrautKompass\Core\Database\Database;
use KrautKompass\Core\Http\HttpException;
use KrautKompass\Core\Logger;
use KrautKompass\Domain\PasswordResets\PasswordResetRepository;
use KrautKompass\Domain\Users\UserRepository;
use Throwable;

/**
 * „Passwort vergessen“ per E-Mail-Link.
 *
 *  - nur verfügbar, wenn Mailversand und app.url konfiguriert sind (keine vorgetäuschte Funktion)
 *  - Antwort ist immer gleich, egal ob die E-Mail existiert (keine Konto-Erkennung)
 *  - Token: 256 Bit Zufall, in der DB nur als SHA-256, befristet und einmalig
 *  - nach dem Zurücksetzen werden alle Sitzungen beendet
 */
final class PasswordReset
{
    public function __construct(
        private readonly Config $config,
        private readonly Mailer $mailer,
        private readonly UserRepository $users,
        private readonly PasswordResetRepository $resets,
        private readonly PasswordHasher $hasher,
        private readonly RateLimiter $limiter,
        private readonly Database $db,
        private readonly Logger $logger,
    ) {
    }

    public function available(): bool
    {
        return $this->mailer->enabled() && $this->appUrl() !== null;
    }

    public function request(string $email, string $ip): void
    {
        $this->guardAvailable();
        $this->limiter->hit("reset-ip:$ip", 5, 15);
        $this->limiter->hit('reset-mail:' . hash('sha256', mb_strtolower($email)), 3, 60);

        $user = $this->users->findForLogin($email);
        if ($user === null || $user['status'] !== 'active') {
            $this->logger->info('password_reset_unknown', ['ip' => $ip]);
            return;
        }
        $token = bin2hex(random_bytes(32));
        $minutes = $this->config->int('security.reset_valid_minutes');
        $this->resets->create((int) $user['id'], hash('sha256', $token), $minutes);

        $link = $this->appUrl() . '/passwort-neu?token=' . $token;
        $body = "Hallo {$user['display_name']},\n\n"
            . "für dein KrautKompass-Konto wurde ein neues Passwort angefordert.\n"
            . "Über diesen Link vergibst du es (gültig für $minutes Minuten, nur einmal nutzbar):\n\n"
            . "$link\n\n"
            . "Du hast nichts angefordert? Dann ignoriere diese Mail einfach, dein Passwort bleibt unverändert.\n";
        try {
            $this->mailer->send((string) $user['email'], 'KrautKompass: Passwort zurücksetzen', $body);
            $this->logger->info('password_reset_requested', ['user_id' => (int) $user['id']]);
        } catch (Throwable $e) {
            // Nach außen bleibt die Antwort neutral; der Fehler steht im Log.
            $this->logger->error('password_reset_mail_failed', ['user_id' => (int) $user['id'], 'error' => $e->getMessage()]);
        }
    }

    public function reset(string $token, string $password, string $ip): void
    {
        $this->guardAvailable();
        $this->limiter->hit("reset-confirm-ip:$ip", 10, 15);
        $invalid = HttpException::validation(['token' => 'Der Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an.']);
        if (preg_match('/^[a-f0-9]{64}$/', $token) !== 1) {
            throw $invalid;
        }
        $userId = $this->db->transaction(function () use ($token, $password, $invalid): int {
            $row = $this->resets->findValid(hash('sha256', $token));
            if ($row === null || !$this->resets->markUsed((int) $row['id'])) {
                throw $invalid;
            }
            $userId = (int) $row['user_id'];
            $this->users->update($userId, ['password_hash' => $this->hasher->hash($password)]);
            $this->users->bumpSessionVersion($userId);
            $this->resets->deleteForUser($userId);
            return $userId;
        });
        $this->logger->info('password_reset_done', ['user_id' => $userId]);
    }

    private function guardAvailable(): void
    {
        if (!$this->available()) {
            throw new HttpException(503, 'reset_unavailable', 'Passwort-Reset ist nicht eingerichtet. Bitte wende dich an deinen Admin.');
        }
    }

    private function appUrl(): ?string
    {
        $url = rtrim((string) $this->config->get('app.url', ''), '/');
        return preg_match('#^https?://[^\s/?\#]+(/[^\s?\#]*)?$#', $url) === 1 ? $url : null;
    }
}
