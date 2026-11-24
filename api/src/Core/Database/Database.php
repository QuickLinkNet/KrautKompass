<?php

declare(strict_types=1);

namespace KrautKompass\Core\Database;

use PDO;
use PDOStatement;
use Throwable;

/**
 * Dünne PDO-Hülle für SQLite: legt die Datei an, setzt sichere Defaults
 * und bietet kurze Helfer für die Repositories.
 */
final class Database
{
    private PDO $pdo;

    private int $transactionDepth = 0;

    public function __construct(string $path)
    {
        if ($path !== ':memory:') {
            $dir = dirname($path);
            if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
                throw new \RuntimeException('Datenbank-Verzeichnis kann nicht angelegt werden: ' . $dir);
            }
        }
        $this->pdo = new PDO('sqlite:' . $path, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $this->pdo->exec('PRAGMA foreign_keys = ON');
        $this->pdo->exec('PRAGMA busy_timeout = 5000');
        if ($path !== ':memory:') {
            $this->pdo->exec('PRAGMA journal_mode = WAL');
        }
    }

    public function pdo(): PDO
    {
        return $this->pdo;
    }

    /** @param array<string|int, mixed> $params */
    public function run(string $sql, array $params = []): PDOStatement
    {
        $stmt = $this->pdo->prepare($sql);
        foreach ($params as $key => $value) {
            $type = match (true) {
                is_int($value), is_bool($value) => PDO::PARAM_INT,
                $value === null => PDO::PARAM_NULL,
                default => PDO::PARAM_STR,
            };
            $stmt->bindValue(is_int($key) ? $key + 1 : $key, is_bool($value) ? (int) $value : $value, $type);
        }
        $stmt->execute();
        return $stmt;
    }

    /**
     * @param array<string|int, mixed> $params
     * @return array<string, mixed>|null
     */
    public function one(string $sql, array $params = []): ?array
    {
        $row = $this->run($sql, $params)->fetch();
        return $row === false ? null : $row;
    }

    /**
     * @param array<string|int, mixed> $params
     * @return list<array<string, mixed>>
     */
    public function all(string $sql, array $params = []): array
    {
        return $this->run($sql, $params)->fetchAll();
    }

    /** @param array<string|int, mixed> $params */
    public function scalar(string $sql, array $params = []): mixed
    {
        $value = $this->run($sql, $params)->fetchColumn();
        return $value === false ? null : $value;
    }

    /** @param array<string, mixed> $data */
    public function insert(string $table, array $data): int
    {
        $columns = array_keys($data);
        $sql = sprintf(
            'INSERT INTO %s (%s) VALUES (%s)',
            $table,
            implode(', ', $columns),
            implode(', ', array_map(static fn (string $c): string => ':' . $c, $columns)),
        );
        $this->run($sql, $data);
        return (int) $this->pdo->lastInsertId();
    }

    /**
     * @param array<string, mixed> $data
     * @param array<string, mixed> $where
     */
    public function update(string $table, array $data, array $where): int
    {
        $set = implode(', ', array_map(static fn (string $c): string => "$c = :set_$c", array_keys($data)));
        $cond = implode(' AND ', array_map(static fn (string $c): string => "$c = :where_$c", array_keys($where)));
        $params = [];
        foreach ($data as $k => $v) {
            $params['set_' . $k] = $v;
        }
        foreach ($where as $k => $v) {
            $params['where_' . $k] = $v;
        }
        return $this->run("UPDATE $table SET $set WHERE $cond", $params)->rowCount();
    }

    /**
     * Schreibtransaktion mit BEGIN IMMEDIATE: Die Schreibsperre wird sofort geholt,
     * so können zwei parallele Requests nicht beide denselben Zustand lesen und dann
     * schreiben (z. B. dieselbe Einladung einlösen). Verschachtelte Aufrufe laufen
     * in der äußeren Transaktion mit.
     *
     * @template T
     * @param callable(Database): T $callback
     * @return T
     */
    public function transaction(callable $callback): mixed
    {
        if ($this->transactionDepth > 0) {
            $this->transactionDepth++;
            try {
                return $callback($this);
            } finally {
                $this->transactionDepth--;
            }
        }
        $this->pdo->exec('BEGIN IMMEDIATE');
        $this->transactionDepth = 1;
        try {
            $result = $callback($this);
            $this->pdo->exec('COMMIT');
            return $result;
        } catch (Throwable $e) {
            $this->pdo->exec('ROLLBACK');
            throw $e;
        } finally {
            $this->transactionDepth = 0;
        }
    }
}
