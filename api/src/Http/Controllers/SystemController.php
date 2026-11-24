<?php

declare(strict_types=1);

namespace KrautKompass\Http\Controllers;

use KrautKompass\Core\Config;
use KrautKompass\Core\Controller;
use KrautKompass\Core\Http\Request;
use KrautKompass\Core\Http\Response;
use KrautKompass\Core\Session;
use KrautKompass\Core\Validator;
use KrautKompass\Domain\Settings\SettingsRepository;
use KrautKompass\Services\Auth;
use KrautKompass\Services\Installer;

/**
 * Einstieg für das Frontend: Status (installiert? angemeldet? CSRF-Token)
 * und der einmalige Einrichtungsassistent.
 */
final class SystemController extends Controller
{
    public function __construct(
        private readonly Config $config,
        private readonly Installer $installer,
        private readonly SettingsRepository $settings,
        private readonly Session $session,
        private readonly Auth $auth,
    ) {
    }

    public function status(Request $request): Response
    {
        $installed = $this->installer->isInstalled();
        $data = [
            'app' => $this->config->string('app.name'),
            'version' => $this->config->string('app.version'),
            'installed' => $installed,
            'instanceName' => $this->settings->get('instance_name', $this->config->string('app.name')),
            'csrfToken' => $this->session->csrfToken(),
            'user' => $installed ? $this->auth->currentUser() : null,
        ];
        if (!$installed) {
            $data['requirements'] = $this->installer->requirements();
        }
        return $this->json($data);
    }

    public function install(Request $request): Response
    {
        if ($this->installer->isInstalled()) {
            return Response::error(409, 'already_installed', 'KrautKompass ist bereits eingerichtet.');
        }
        $min = $this->config->int('security.password_min_length');
        $input = Validator::validate($request->json(), [
            'instance_name' => 'string|max:60',
            'display_name' => 'required|string|min:2|max:40',
            'email' => 'required|email|max:120',
            'password' => "required|raw|string|min:$min|max:200",
        ]);
        $failed = array_filter($this->installer->requirements(), static fn (array $r): bool => !$r['ok']);
        if ($failed !== []) {
            return Response::error(422, 'requirements_failed', 'Systemvoraussetzungen nicht erfüllt.', [
                'requirements' => array_values($failed),
            ]);
        }
        $id = $this->installer->install([
            'email' => (string) $input['email'],
            'display_name' => (string) $input['display_name'],
            'password' => (string) $input['password'],
        ], (string) ($input['instance_name'] ?? $this->config->string('app.name')));

        return $this->json(['user' => $this->auth->loginById($id), 'csrfToken' => $this->session->csrfToken()], 201);
    }

    /** Vokabular für Formulare: Wirkungen, Nebenwirkungen, Konsumformen, Skala. */
    public function meta(Request $request): Response
    {
        $ratings = $this->config->array('ratings');
        $toList = static fn (array $map): array => array_map(
            static fn (string $key, string $label): array => ['key' => $key, 'label' => $label],
            array_keys($map),
            $map,
        );
        return $this->json([
            'scaleMax' => (int) $ratings['scale_max'],
            'effects' => $toList($ratings['effects']),
            'sideEffects' => $toList($ratings['side_effects']),
            'methods' => $toList($ratings['methods']),
        ]);
    }
}
