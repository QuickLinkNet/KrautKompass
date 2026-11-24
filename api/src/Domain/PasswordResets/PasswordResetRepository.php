<?php

declare(strict_types=1);

namespace KrautKompass\Domain\PasswordResets;

use KrautKompass\Core\Database\Database;
use KrautKompass\Support\Clock;

final class PasswordResetRepository
{
    public function __construct(private readonly Database $db)
    {
    }

    /** Legt einen neuen Token an; ältere offene Tokens des Benutzers verfallen dabei. */
    public function create(int $userId, string $tokenHash, int $validMinutes): void
    {
        $this->db->run('DELETE FROM password_resets WHERE user_id = ? OR expires_at < ?', [$userId, Clock::now()]);
        $this->db->insert('password_resets', [
            'user_id' => $userId,
            'token_hash' => $tokenHash,
            'expires_at' => Clock::inMinutes($validMinutes),
            'created_at' => Clock::now(),
        ]);
    }

    /** @return array<string, mixed>|null nur unbenutzte, nicht abgelaufene Tokens */
    public function findValid(string $tokenHash): ?array
    {
        return $this->db->one(
            'SELECT * FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?',
            [$tokenHash, Clock::now()],
        );
    }

    /** Atomar: liefert false, wenn der Token inzwischen schon benutzt wurde. */
    public function markUsed(int $id): bool
    {
        $stmt = $this->db->run(
            'UPDATE password_resets SET used_at = ? WHERE id = ? AND used_at IS NULL',
            [Clock::now(), $id],
        );
        return $stmt->rowCount() === 1;
    }

    public function deleteForUser(int $userId): void
    {
        $this->db->run('DELETE FROM password_resets WHERE user_id = ?', [$userId]);
    }
}
