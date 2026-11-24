<?php

declare(strict_types=1);

namespace KrautKompass\Domain\Invites;

use KrautKompass\Core\Database\Database;
use KrautKompass\Support\Clock;

final class InviteRepository
{
    /** Ohne 0/O/1/I/L, damit Codes sich gut abtippen lassen. */
    private const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

    public function __construct(private readonly Database $db)
    {
    }

    public function create(string $role, ?string $note, int $validDays, ?int $createdBy): array
    {
        $code = $this->generateCode();
        $id = $this->db->insert('invites', [
            'code' => $code,
            'role' => $role,
            'note' => $note,
            'created_by' => $createdBy,
            'expires_at' => Clock::inDays($validDays),
            'created_at' => Clock::now(),
        ]);
        return $this->find($id) ?? [];
    }

    /** @return array<string, mixed>|null */
    public function find(int $id): ?array
    {
        return $this->db->one('SELECT * FROM invites WHERE id = ?', [$id]);
    }

    /** @return array<string, mixed>|null nur einlösbare Einladungen */
    public function findRedeemable(string $code): ?array
    {
        return $this->db->one(
            'SELECT * FROM invites
             WHERE code = :code AND used_at IS NULL AND revoked_at IS NULL AND expires_at > :now',
            ['code' => strtoupper(trim($code)), 'now' => Clock::now()],
        );
    }

    /** @return list<array<string, mixed>> */
    public function all(): array
    {
        return $this->db->all(
            'SELECT i.*, u.display_name AS used_by_name
             FROM invites i LEFT JOIN users u ON u.id = i.used_by
             ORDER BY i.created_at DESC'
        );
    }

    /** Atomar: nur erfolgreich, wenn die Einladung noch offen ist. */
    public function markUsed(int $id, int $userId): bool
    {
        return $this->db->run(
            'UPDATE invites SET used_by = :user, used_at = :now
             WHERE id = :id AND used_at IS NULL AND revoked_at IS NULL AND expires_at > :now',
            ['user' => $userId, 'now' => Clock::now(), 'id' => $id],
        )->rowCount() > 0;
    }

    public function revoke(int $id): bool
    {
        return $this->db->run(
            'UPDATE invites SET revoked_at = :now WHERE id = :id AND used_at IS NULL AND revoked_at IS NULL',
            ['now' => Clock::now(), 'id' => $id],
        )->rowCount() > 0;
    }

    private function generateCode(): string
    {
        do {
            $chars = '';
            for ($i = 0; $i < 8; $i++) {
                $chars .= self::ALPHABET[random_int(0, strlen(self::ALPHABET) - 1)];
            }
            $code = 'KK-' . substr($chars, 0, 4) . '-' . substr($chars, 4);
        } while ($this->db->scalar('SELECT 1 FROM invites WHERE code = ?', [$code]));
        return $code;
    }
}
