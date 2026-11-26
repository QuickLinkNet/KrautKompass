<?php

declare(strict_types=1);

namespace KrautKompass\Domain\Users;

use KrautKompass\Core\Database\Database;
use KrautKompass\Support\Clock;

final class UserRepository
{
    private const PUBLIC_COLUMNS = 'id, email, display_name, role, status, created_at, last_login_at, welcomed_at';

    public function __construct(private readonly Database $db)
    {
    }

    /** @return array<string, mixed>|null ohne Passwort-Hash */
    public function find(int $id): ?array
    {
        return $this->db->one('SELECT ' . self::PUBLIC_COLUMNS . ' FROM users WHERE id = ?', [$id]);
    }

    /** @return array<string, mixed>|null inklusive Passwort-Hash, nur für den Login */
    public function findForLogin(string $email): ?array
    {
        return $this->db->one('SELECT * FROM users WHERE email = ?', [$email]);
    }

    public function emailExists(string $email): bool
    {
        return (bool) $this->db->scalar('SELECT 1 FROM users WHERE email = ?', [$email]);
    }

    public function countAdmins(): int
    {
        return (int) $this->db->scalar("SELECT COUNT(*) FROM users WHERE role = 'admin' AND status = 'active'");
    }

    /** @return list<array<string, mixed>> */
    public function all(): array
    {
        return $this->db->all('SELECT ' . self::PUBLIC_COLUMNS . ' FROM users ORDER BY created_at');
    }

    public function create(string $email, string $displayName, string $passwordHash, string $role): int
    {
        $now = Clock::now();
        return $this->db->insert('users', [
            'email' => $email,
            'display_name' => $displayName,
            'password_hash' => $passwordHash,
            'role' => $role,
            'status' => 'active',
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    /** @param array<string, mixed> $changes erlaubt: display_name, role, status, password_hash */
    public function update(int $id, array $changes): void
    {
        $allowed = array_intersect_key($changes, array_flip(['display_name', 'role', 'status', 'password_hash', 'welcomed_at']));
        if ($allowed === []) {
            return;
        }
        $allowed['updated_at'] = Clock::now();
        $this->db->update('users', $allowed, ['id' => $id]);
    }

    public function touchLogin(int $id): void
    {
        $this->db->update('users', ['last_login_at' => Clock::now()], ['id' => $id]);
    }

    public function sessionVersion(int $id): ?int
    {
        $value = $this->db->scalar('SELECT session_version FROM users WHERE id = ?', [$id]);
        return $value === null ? null : (int) $value;
    }

    /** Macht alle bestehenden Sitzungen dieses Benutzers ungültig. */
    public function bumpSessionVersion(int $id): void
    {
        $this->db->run('UPDATE users SET session_version = session_version + 1 WHERE id = ?', [$id]);
    }
}
