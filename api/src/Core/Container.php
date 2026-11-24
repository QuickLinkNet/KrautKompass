<?php

declare(strict_types=1);

namespace KrautKompass\Core;

use Closure;
use ReflectionClass;
use ReflectionNamedType;
use RuntimeException;

/**
 * Kleiner DI-Container: explizite Factories für Infrastruktur (Database, Config …),
 * alles andere wird per Konstruktor-Reflection aufgelöst. Jede Klasse ist ein Singleton.
 */
final class Container
{
    /** @var array<string, Closure(Container): object> */
    private array $factories = [];

    /** @var array<string, object> */
    private array $instances = [];

    /** @param Closure(Container): object $factory */
    public function set(string $id, Closure $factory): void
    {
        $this->factories[$id] = $factory;
        unset($this->instances[$id]);
    }

    public function instance(string $id, object $object): void
    {
        $this->instances[$id] = $object;
    }

    /**
     * @template T of object
     * @param class-string<T> $id
     * @return T
     */
    public function get(string $id): object
    {
        if (!isset($this->instances[$id])) {
            $this->instances[$id] = isset($this->factories[$id])
                ? ($this->factories[$id])($this)
                : $this->build($id);
        }
        /** @var T */
        return $this->instances[$id];
    }

    private function build(string $class): object
    {
        if (!class_exists($class)) {
            throw new RuntimeException("Klasse $class nicht gefunden.");
        }
        $reflection = new ReflectionClass($class);
        $constructor = $reflection->getConstructor();
        if ($constructor === null) {
            return new $class();
        }
        $args = [];
        foreach ($constructor->getParameters() as $param) {
            $type = $param->getType();
            // Optionale Abhängigkeiten (?Foo $foo = null) bekommen ihren Default,
            // die Klasse baut sie dann selbst passend zur Konfiguration.
            $optional = $param->isDefaultValueAvailable() && $type?->allowsNull();
            if ($type instanceof ReflectionNamedType && !$type->isBuiltin() && !$optional) {
                $args[] = $this->get($type->getName());
            } elseif ($param->isDefaultValueAvailable()) {
                $args[] = $param->getDefaultValue();
            } else {
                throw new RuntimeException("Parameter \${$param->getName()} von $class nicht auflösbar.");
            }
        }
        return $reflection->newInstanceArgs($args);
    }
}
