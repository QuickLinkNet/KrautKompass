<?php

declare(strict_types=1);

namespace KrautKompass\Core;

use Closure;
use KrautKompass\Core\Database\Database;
use KrautKompass\Core\Http\HttpException;
use KrautKompass\Core\Http\Request;
use KrautKompass\Core\Http\Response;
use KrautKompass\Core\Http\Router;
use KrautKompass\Http\Middleware\AdminMiddleware;
use KrautKompass\Http\Middleware\AuthMiddleware;
use KrautKompass\Http\Middleware\CsrfMiddleware;
use KrautKompass\Http\Middleware\InstalledMiddleware;
use KrautKompass\Services\Installer;
use Throwable;

/**
 * Herzstück: baut den Container, bereitet das System selbstständig vor
 * (Verzeichnisse, Datenbank, Migrationen) und verarbeitet Requests.
 */
final class Kernel
{
    /** Middleware-Schlüssel, die in routes/api.php verwendet werden. */
    private const MIDDLEWARE = [
        'installed' => InstalledMiddleware::class,
        'auth' => AuthMiddleware::class,
        'admin' => AdminMiddleware::class,
    ];

    public readonly Container $container;

    private ?Router $router = null;

    /** @param array<string, mixed> $config */
    public function __construct(array $config)
    {
        date_default_timezone_set((string) ($config['app']['timezone'] ?? 'UTC'));
        $this->container = new Container();
        $this->container->instance(Config::class, new Config($config));
        $this->container->set(Database::class, static fn (Container $c): Database => new Database(
            $c->get(Config::class)->string('paths.database'),
        ));
    }

    /** Legt fehlende Verzeichnisse an und spielt ausstehende Migrationen ein. */
    public function boot(): self
    {
        $this->container->get(Installer::class)->prepare();
        return $this;
    }

    /**
     * Für den Webbetrieb: PHP-Warnungen werden zu Exceptions (landen im Log statt in der
     * Antwort), fatale Fehler liefern trotzdem sauberes JSON.
     */
    public static function registerErrorHandling(): void
    {
        ini_set('display_errors', '0');
        error_reporting(E_ALL);
        set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
            if (!(error_reporting() & $severity)) {
                return false;
            }
            // Deprecations (z. B. nach einem PHP-Update beim Hoster) nur loggen, nicht abbrechen.
            if (in_array($severity, [E_DEPRECATED, E_USER_DEPRECATED], true)) {
                error_log("[KrautKompass] deprecated: $message in $file:$line");
                return true;
            }
            throw new \ErrorException($message, 0, $severity, $file, $line);
        });
        register_shutdown_function(static function (): void {
            $error = error_get_last();
            if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
                error_log('[KrautKompass] fatal: ' . $error['message'] . ' in ' . $error['file'] . ':' . $error['line']);
                if (!headers_sent()) {
                    Response::error(500, 'server_error', 'Interner Fehler.')->send();
                }
            }
        });
    }

    public function handle(Request $request): Response
    {
        try {
            $this->guardBody($request);
            $this->boot();
            $this->container->get(Session::class)->start($request->secure);
            $match = $this->router()->match($request->method, $request->path);
            $request = $request->withParams($match['params']);

            [$class, $method] = $match['handler'];
            $core = fn (Request $r): Response => $this->container->get($class)->$method($r);
            $pipeline = array_reduce(
                array_reverse([CsrfMiddleware::class, ...$this->resolveMiddleware($match['middleware'])]),
                fn (Closure $next, string $mw): Closure => fn (Request $r): Response => $this->container
                    ->get($mw)->handle($r, $next),
                $core,
            );
            return $pipeline($request);
        } catch (HttpException $e) {
            return Response::error($e->status, $e->errorCode, $e->getMessage(), $e->details);
        } catch (Throwable $e) {
            return $this->internalError($e);
        }
    }

    /** Größenlimit und JSON-Pflicht für Request-Bodies (auch Schutz gegen Formular-CSRF). */
    private function guardBody(Request $request): void
    {
        $max = $this->container->get(Config::class)->int('security.max_body_bytes');
        if ($request->bodySize() > $max) {
            throw new HttpException(413, 'payload_too_large', 'Anfrage zu groß.');
        }
        if ($request->bodySize() > 0 && !$request->isJson()) {
            throw new HttpException(415, 'unsupported_media_type', 'Nur JSON wird akzeptiert.');
        }
    }

    public function router(): Router
    {
        if ($this->router === null) {
            $this->router = new Router();
            (require KK_ROOT . '/routes/api.php')($this->router);
        }
        return $this->router;
    }

    /**
     * @param list<string> $keys
     * @return list<class-string<Middleware>>
     */
    private function resolveMiddleware(array $keys): array
    {
        return array_map(static function (string $key): string {
            return self::MIDDLEWARE[$key] ?? throw new \RuntimeException("Unbekannte Middleware: $key");
        }, $keys);
    }

    private function internalError(Throwable $e): Response
    {
        $config = $this->container->get(Config::class);
        try {
            $this->container->get(Logger::class)->error($e->getMessage(), [
                'exception' => $e::class,
                'file' => $e->getFile() . ':' . $e->getLine(),
            ]);
        } catch (Throwable) {
            error_log('[KrautKompass] ' . $e->getMessage());
        }
        $details = $config->bool('app.debug')
            ? ['exception' => $e::class, 'message' => $e->getMessage(), 'file' => $e->getFile() . ':' . $e->getLine()]
            : [];
        return Response::error(500, 'server_error', 'Interner Fehler. Details stehen im Log.', $details);
    }
}
