<?php

declare(strict_types=1);

namespace KrautKompass\Services;

use KrautKompass\Core\Config;
use KrautKompass\Core\Logger;
use RuntimeException;

/**
 * Minimaler Mailversand ohne Abhängigkeiten (Klartext, UTF-8).
 *
 * Transporte (config mail.transport):
 *  - none   : kein Versand → Funktionen, die Mails brauchen, sind deaktiviert (Standard)
 *  - mail   : PHP mail() des Webspaces, braucht mail.from
 *  - log    : schreibt die Mail ins App-Log (nur mit app.debug, für die Entwicklung)
 *  - memory : hält Mails im Speicher (Tests)
 */
final class Mailer
{
    /** @var list<array{to: string, subject: string, body: string}> */
    public array $sent = [];

    public function __construct(private readonly Config $config, private readonly Logger $logger)
    {
    }

    public function enabled(): bool
    {
        return match ($this->transport()) {
            'mail' => $this->from() !== null,
            'log' => $this->config->bool('app.debug'),
            'memory' => true,
            default => false,
        };
    }

    public function send(string $to, string $subject, string $body): void
    {
        $headerSafe = preg_match('/[\r\n]/', $to . $subject) === 0;
        if (!$this->enabled() || filter_var($to, FILTER_VALIDATE_EMAIL) === false || !$headerSafe) {
            throw new RuntimeException('Mailversand nicht möglich (Konfiguration oder Empfänger ungültig).');
        }
        match ($this->transport()) {
            'mail' => $this->sendViaMail($to, $subject, $body),
            'log' => $this->logger->info('mail_dev', ['to' => $to, 'subject' => $subject, 'body' => $body]),
            default => $this->sent[] = ['to' => $to, 'subject' => $subject, 'body' => $body],
        };
    }

    private function sendViaMail(string $to, string $subject, string $body): void
    {
        $from = (string) $this->from();
        $name = mb_encode_mimeheader($this->config->string('mail.from_name'), 'UTF-8', 'Q');
        $headers = [
            'From' => "$name <$from>",
            'MIME-Version' => '1.0',
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Content-Transfer-Encoding' => '8bit',
            'Auto-Submitted' => 'auto-generated',
        ];
        $encodedSubject = mb_encode_mimeheader($subject, 'UTF-8', 'Q');
        $ok = mail($to, $encodedSubject, str_replace("\n", "\r\n", $body), $headers, '-f' . $from);
        if (!$ok) {
            $this->logger->error('mail_failed', ['to' => $to, 'subject' => $subject]);
            throw new RuntimeException('Mailversand fehlgeschlagen.');
        }
    }

    private function transport(): string
    {
        return (string) $this->config->get('mail.transport', 'none');
    }

    private function from(): ?string
    {
        $from = (string) $this->config->get('mail.from', '');
        $valid = filter_var($from, FILTER_VALIDATE_EMAIL) !== false && preg_match('/[\r\n<>]/', $from) === 0;
        return $valid ? $from : null;
    }
}
