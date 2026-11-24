<?php

declare(strict_types=1);

namespace KrautKompass\Services;

/**
 * Argon2id, wenn PHP es mitbringt, sonst bcrypt. Alte Hashes werden beim Login
 * über needsRehash() automatisch aktualisiert.
 */
final class PasswordHasher
{
    private function algorithm(): string|int
    {
        return defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT;
    }

    public function hash(string $password): string
    {
        return password_hash($password, $this->algorithm());
    }

    public function verify(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    public function needsRehash(string $hash): bool
    {
        return password_needs_rehash($hash, $this->algorithm());
    }
}
