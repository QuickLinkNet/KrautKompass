import { Link } from 'react-router';
import { useSession } from '../features/session/sessionContext';
import { LegalLayout } from '../components/templates/LegalLayout/LegalLayout';

/** Datenschutzerklärung, passend zu dem, was die App tatsächlich verarbeitet (Stand 11/2026). */
export function PrivacyPage() {
  const legal = useSession().status?.legal;

  return (
    <LegalLayout title="Datenschutz">
      <p>Stand: November 2026</p>

      <h2>Verantwortlich</h2>
      {legal?.name ? (
        <address>
          {legal.name}<br />
          {legal.street}<br />
          {legal.city}
          {legal.email && <><br />E-Mail: <a href={`mailto:${legal.email}`}>{legal.email}</a></>}
        </address>
      ) : (
        <p>Siehe <Link to="/impressum">Impressum</Link>.</p>
      )}

      <h2>Kurz gesagt</h2>
      <ul>
        <li>Zugang nur mit Einladung. Keine Werbung, kein Tracking, keine Analyse-Dienste.</li>
        <li>Keine fremden Server im Browser: Schriften, Bilder und App-Dateien kommen von dieser Adresse.</li>
        <li>Deine Bewertungen sind „Nur für mich“, bis du sie selbst mit der Runde teilst.</li>
      </ul>

      <h2>Konto</h2>
      <p>
        Gespeichert werden E-Mail-Adresse, Anzeigename, Rolle und dein Passwort, dieses nur als sicherer Hash. Zweck ist der
        Zugang zur App (Art. 6 Abs. 1 lit. b DSGVO). Die Daten bleiben, bis dein Konto gelöscht wird.
      </p>

      <h2>Bewertungen und Merkliste</h2>
      <p>
        Bewertungen können Angaben zu Wirkungen, Nebenwirkungen, Konsumform, Datum und eigene Notizen enthalten. Das können
        Gesundheitsdaten sein. Du machst diese Angaben freiwillig, die Grundlage ist deine Einwilligung (Art. 9 Abs. 2 lit. a
        DSGVO). Du kannst sie jederzeit widerrufen, indem du einzelne Bewertungen löschst oder dein Konto löschen lässt.
        „Nur für mich“ sieht niemand außer dir. „Mit der Runde teilen“ zeigt die Bewertung den eingeladenen Mitgliedern.
      </p>

      <h2>Cookies und Speicher im Browser</h2>
      <ul>
        <li><strong>kk_session</strong>: technisch notwendiges Sitzungs-Cookie für die Anmeldung, bis zu 30 Tage.</li>
        <li>Lokaler Speicher: gewählte Ansicht im Katalog und ob du den Hinweis zum Installieren ausgeblendet hast.</li>
        <li>
          Als installierte App speichert dein Gerät App-Dateien und Produktbilder für einen schnellen Start. Bewertungen und
          Kontodaten werden dabei nicht auf dem Gerät gespeichert.
        </li>
      </ul>
      <p>Dafür ist keine Einwilligung nötig, weil es für die Funktion erforderlich ist (§ 25 Abs. 2 TDDDG).</p>

      <h2>Hosting und Server-Protokolle</h2>
      <p>
        Die App läuft bei der Alfahosting GmbH in Deutschland. Beim Aufruf verarbeitet der Server technisch nötige Daten wie
        IP-Adresse, Zeitpunkt und aufgerufene Adresse, um die App sicher bereitzustellen (Art. 6 Abs. 1 lit. f DSGVO). Zum
        Schutz vor Angriffen werden Anmeldeversuche kurzzeitig gezählt. Fehlerprotokolle enthalten keine Bewertungsinhalte.
      </p>

      <h2>E-Mails</h2>
      <p>
        Wenn du „Passwort vergessen“ nutzt, bekommst du eine E-Mail mit einem Link, der 60 Minuten gilt. Versendet wird sie über
        den Mailserver des Hosters.
      </p>

      <h2>Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und
        Widerspruch sowie auf Widerruf einer Einwilligung. Schreib dafür an die oben genannte Adresse. Außerdem kannst du dich
        bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der Landesbeauftragten für Datenschutz und
        Informationsfreiheit Nordrhein-Westfalen.
      </p>
    </LegalLayout>
  );
}
