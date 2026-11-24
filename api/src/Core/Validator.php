<?php

declare(strict_types=1);

namespace KrautKompass\Core;

use KrautKompass\Core\Http\HttpException;

/**
 * Regelbasierte Eingabeprüfung. Regeln als String, z. B. 'required|email|max:120'.
 * Unterstützt: required, raw (nicht trimmen), string, email, int, min:n, max:n (Länge bzw. Wert),
 * in:a,b,c, array, bool. Unbekannte Regeln sind ein Programmierfehler (LogicException).
 * Wirft bei Fehlern eine 422-HttpException mit Feldmeldungen.
 */
final class Validator
{
    /**
     * @param array<string, mixed> $data
     * @param array<string, string> $rules
     * @return array<string, mixed> nur die geprüften Felder
     */
    public static function validate(array $data, array $rules): array
    {
        $errors = [];
        $clean = [];
        foreach ($rules as $field => $ruleString) {
            $value = $data[$field] ?? null;
            $ruleList = explode('|', $ruleString);
            // 'raw' = nicht trimmen (Passwörter dürfen Leerzeichen am Rand haben)
            if (is_string($value) && !in_array('raw', $ruleList, true)) {
                $value = trim($value);
            }
            $empty = $value === null || $value === '' || $value === [];
            if ($empty) {
                if (in_array('required', $ruleList, true)) {
                    $errors[$field] = 'Pflichtfeld.';
                }
                $clean[$field] = null;
                continue;
            }
            $error = self::check($value, $ruleList);
            if ($error !== null) {
                $errors[$field] = $error;
                continue;
            }
            $clean[$field] = in_array('int', $ruleList, true) ? (int) $value : $value;
        }
        if ($errors !== []) {
            throw HttpException::validation($errors);
        }
        return $clean;
    }

    /** @param list<string> $rules */
    private static function check(mixed $value, array $rules): ?string
    {
        $numeric = in_array('int', $rules, true);
        // Typ-Härtung: Listen nur, wo 'array' erlaubt ist, und dann nur mit skalaren Einträgen.
        if (in_array('array', $rules, true)) {
            if (is_array($value) && array_filter($value, static fn (mixed $v): bool => !is_scalar($v)) !== []) {
                return 'Ungültige Listeneinträge.';
            }
        } elseif (!is_scalar($value)) {
            return 'Ungültiger Wert.';
        }
        foreach ($rules as $rule) {
            [$name, $arg] = array_pad(explode(':', $rule, 2), 2, null);
            $error = match ($name) {
                'string' => is_string($value) ? null : 'Muss Text sein.',
                'email' => filter_var($value, FILTER_VALIDATE_EMAIL) ? null : 'Keine gültige E-Mail-Adresse.',
                'int' => !is_bool($value) && filter_var($value, FILTER_VALIDATE_INT) !== false
                    ? null : 'Muss eine ganze Zahl sein.',
                'bool' => is_bool($value) ? null : 'Muss ja/nein sein.',
                'array' => is_array($value) ? null : 'Muss eine Liste sein.',
                'in' => in_array((string) $value, explode(',', (string) $arg), true) ? null : 'Ungültiger Wert.',
                'min' => self::size($value, $numeric) >= (int) $arg ? null : self::minMessage($numeric, (int) $arg),
                'max' => self::size($value, $numeric) <= (int) $arg ? null : self::maxMessage($numeric, (int) $arg),
                'required', 'raw' => null,
                default => throw new \LogicException("Unbekannte Validierungsregel: $name"),
            };
            if ($error !== null) {
                return $error;
            }
        }
        return null;
    }

    private static function size(mixed $value, bool $numeric): int
    {
        return match (true) {
            $numeric => (int) $value,
            is_array($value) => count($value),
            default => mb_strlen((string) $value),
        };
    }

    private static function minMessage(bool $numeric, int $n): string
    {
        return $numeric ? "Mindestens $n." : "Mindestens $n Zeichen.";
    }

    private static function maxMessage(bool $numeric, int $n): string
    {
        return $numeric ? "Höchstens $n." : "Höchstens $n Zeichen.";
    }
}
