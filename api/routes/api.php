<?php

declare(strict_types=1);

use KrautKompass\Core\Http\Router;
use KrautKompass\Http\Controllers\Admin\SyncAdminController;
use KrautKompass\Http\Controllers\Admin\UserAdminController;
use KrautKompass\Http\Controllers\AuthController;
use KrautKompass\Http\Controllers\ProductController;
use KrautKompass\Http\Controllers\RatingController;
use KrautKompass\Http\Controllers\SystemController;

/*
 * Alle Endpunkte liegen unter /api. Schreibende Requests brauchen immer den
 * Header X-CSRF-Token (globale Middleware im Kernel).
 */
return static function (Router $r): void {
    $r->group('/api', [], static function (Router $r): void {
        // Immer erreichbar: Status + Einrichtung
        $r->get('/system/status', [SystemController::class, 'status']);
        $r->post('/system/install', [SystemController::class, 'install']);

        $r->group('', ['installed'], static function (Router $r): void {
            // Öffentlich (ohne Login)
            $r->post('/auth/login', [AuthController::class, 'login']);
            $r->post('/auth/register', [AuthController::class, 'register']);
            $r->get('/invites/{code}', [AuthController::class, 'checkInvite']);

            // Angemeldet
            $r->group('', ['auth'], static function (Router $r): void {
                $r->post('/auth/logout', [AuthController::class, 'logout']);
                $r->get('/auth/me', [AuthController::class, 'me']);
                $r->patch('/auth/me', [AuthController::class, 'updateProfile']);
                $r->get('/meta', [SystemController::class, 'meta']);

                $r->get('/products', [ProductController::class, 'index']);
                $r->get('/products/facets', [ProductController::class, 'facets']);
                $r->get('/products/{id}', [ProductController::class, 'show']);
                $r->put('/products/{id}/rating', [RatingController::class, 'upsert']);
                $r->delete('/products/{id}/rating', [RatingController::class, 'destroy']);

                $r->get('/ratings/mine', [RatingController::class, 'mine']);
                $r->get('/ratings/feed', [RatingController::class, 'feed']);

                // Admin
                $r->group('/admin', ['admin'], static function (Router $r): void {
                    $r->get('/users', [UserAdminController::class, 'users']);
                    $r->patch('/users/{id}', [UserAdminController::class, 'updateUser']);
                    $r->get('/invites', [UserAdminController::class, 'invites']);
                    $r->post('/invites', [UserAdminController::class, 'createInvite']);
                    $r->delete('/invites/{id}', [UserAdminController::class, 'revokeInvite']);
                    $r->get('/sync', [SyncAdminController::class, 'runs']);
                    $r->post('/sync', [SyncAdminController::class, 'start']);
                });
            });
        });
    });
};
