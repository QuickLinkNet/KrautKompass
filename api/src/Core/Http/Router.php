<?php

declare(strict_types=1);

namespace KrautKompass\Core\Http;

use Closure;

/**
 * Minimaler Router: Methoden + Pfadmuster mit {param}, Gruppen mit Präfix und Middleware.
 * Handler sind [ControllerKlasse::class, 'methode'] und werden über die Factory aufgelöst.
 */
final class Router
{
    /** @var list<array{method: string, regex: string, names: list<string>, handler: array{0: class-string, 1: string}, middleware: list<string>}> */
    private array $routes = [];

    private string $prefix = '';

    /** @var list<string> */
    private array $middleware = [];

    /** @param array{0: class-string, 1: string} $handler */
    public function get(string $path, array $handler): void
    {
        $this->add('GET', $path, $handler);
    }

    /** @param array{0: class-string, 1: string} $handler */
    public function post(string $path, array $handler): void
    {
        $this->add('POST', $path, $handler);
    }

    /** @param array{0: class-string, 1: string} $handler */
    public function put(string $path, array $handler): void
    {
        $this->add('PUT', $path, $handler);
    }

    /** @param array{0: class-string, 1: string} $handler */
    public function patch(string $path, array $handler): void
    {
        $this->add('PATCH', $path, $handler);
    }

    /** @param array{0: class-string, 1: string} $handler */
    public function delete(string $path, array $handler): void
    {
        $this->add('DELETE', $path, $handler);
    }

    /**
     * @param list<string> $middleware Middleware-Schlüssel (siehe Kernel)
     * @param Closure(Router): void $routes
     */
    public function group(string $prefix, array $middleware, Closure $routes): void
    {
        [$oldPrefix, $oldMiddleware] = [$this->prefix, $this->middleware];
        $this->prefix .= $prefix;
        $this->middleware = [...$this->middleware, ...$middleware];
        $routes($this);
        [$this->prefix, $this->middleware] = [$oldPrefix, $oldMiddleware];
    }

    /** @param array{0: class-string, 1: string} $handler */
    private function add(string $method, string $path, array $handler): void
    {
        $full = '/' . trim($this->prefix . $path, '/');
        preg_match_all('/\{(\w+)\}/', $full, $matches);
        $regex = '#^' . preg_replace('/\\\{(\w+)\\\}/', '([^/]+)', preg_quote($full, '#')) . '$#';
        $this->routes[] = [
            'method' => $method,
            'regex' => $regex,
            'names' => $matches[1],
            'handler' => $handler,
            'middleware' => $this->middleware,
        ];
    }

    /**
     * @return array{handler: array{0: class-string, 1: string}, middleware: list<string>, params: array<string, string>}
     */
    public function match(string $method, string $path): array
    {
        $pathMatched = false;
        foreach ($this->routes as $route) {
            if (!preg_match($route['regex'], $path, $values)) {
                continue;
            }
            $pathMatched = true;
            if ($route['method'] !== $method) {
                continue;
            }
            $params = array_combine($route['names'], array_map('rawurldecode', array_slice($values, 1)));
            return ['handler' => $route['handler'], 'middleware' => $route['middleware'], 'params' => $params];
        }
        if ($pathMatched) {
            throw new HttpException(405, 'method_not_allowed', 'Methode nicht erlaubt.');
        }
        throw HttpException::notFound('Endpunkt nicht gefunden.');
    }
}
