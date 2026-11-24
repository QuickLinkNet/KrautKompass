<?php

declare(strict_types=1);

use KrautKompass\Core\Http\HttpException;
use KrautKompass\Core\Http\Router;
use KrautKompass\Core\Validator;

return [
    'Router löst Parameter auf' => static function (): void {
        $router = new Router();
        $router->group('/api', [], static function (Router $r): void {
            $r->get('/products/facets', [stdClass::class, 'facets']);
            $r->get('/products/{id}', [stdClass::class, 'show']);
        });
        $match = $router->match('GET', '/api/products/42');
        assert_same('show', $match['handler'][1]);
        assert_same(['id' => '42'], $match['params']);
        assert_same('facets', $router->match('GET', '/api/products/facets')['handler'][1]);
    },

    'Router meldet 405 und 404' => static function (): void {
        $router = new Router();
        $router->get('/api/x', [stdClass::class, 'x']);
        $e = assert_throws(static fn () => $router->match('POST', '/api/x'), HttpException::class);
        assert_same(405, $e->status);
        $e = assert_throws(static fn () => $router->match('GET', '/api/y'), HttpException::class);
        assert_same(404, $e->status);
    },

    'Validator prüft Regeln und liefert saubere Werte' => static function (): void {
        $clean = Validator::validate(
            ['email' => ' a@b.de ', 'n' => '7', 'extra' => 'weg'],
            ['email' => 'required|email', 'n' => 'int|min:1|max:10', 'opt' => 'string'],
        );
        assert_same(['email' => 'a@b.de', 'n' => 7, 'opt' => null], $clean);
    },

    'Validator sammelt Feldfehler' => static function (): void {
        $e = assert_throws(static fn () => Validator::validate(
            ['email' => 'kaputt', 'n' => 11, 'r' => 'x'],
            ['email' => 'required|email', 'n' => 'int|max:10', 'r' => 'in:a,b', 'pflicht' => 'required'],
        ), HttpException::class);
        assert_same(422, $e->status);
        assert_same(['email', 'n', 'r', 'pflicht'], array_keys($e->details['fields']));
    },
];
