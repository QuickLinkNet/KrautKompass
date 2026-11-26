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
use KrautKompass\Services\PasswordReset;

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
        private readonly PasswordReset $passwordReset,
    ) {
    }

    public function status(Request $request): Response
    {
        $adminError = $this->installer->bootstrapAdmin();
        $installed = $this->installer->isInstalled();
        $data = [
            'app' => $this->config->string('app.name'),
            'version' => $this->config->string('app.version'),
            'installed' => $installed,
            'instanceName' => $this->settings->get('instance_name', $this->config->string('app.name')),
            'csrfToken' => $this->session->csrfToken(),
            'user' => $installed ? $this->auth->currentUser() : null,
            'features' => ['passwordReset' => $installed && $this->passwordReset->available()],
            'legal' => $this->legal(),
        ];
        if (!$installed) {
            $data['requirements'] = $this->installer->requirements();
            if ($adminError !== null) {
                $data['requirements'][] = ['key' => 'admin_env', 'label' => $adminError, 'ok' => false];
            }
        }
        return $this->json($data);
    }

    public function install(Request $request): Response
    {
        if ($this->installer->isInstalled()) {
            return Response::error(409, 'already_installed', 'KrautKompass ist bereits eingerichtet.');
        }
        // Schutz vor fremder Ersteinrichtung: ist der Admin in der .env vorgegeben, nur von dort
        if ($this->installer->adminFromConfig()) {
            return Response::error(403, 'setup_via_env', 'Der erste Admin wird über die Server-Konfiguration angelegt.');
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

    /** Anbieterangaben für Impressum/Datenschutz; leeres Objekt, solange Name oder Anschrift fehlen. */
    private function legal(): object
    {
        $value = fn (string $key): ?string => trim((string) $this->config->get("legal.$key", '')) ?: null;
        $email = $value('email');
        $data = array_filter([
            'name' => $value('name'),
            'street' => $value('street'),
            'city' => $value('city'),
            'email' => $email !== null && filter_var($email, FILTER_VALIDATE_EMAIL) !== false ? $email : null,
            'phone' => $value('phone'),
        ]);
        return isset($data['name'], $data['street'], $data['city']) ? (object) $data : (object) [];
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
