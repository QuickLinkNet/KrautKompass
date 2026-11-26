import { useSession } from '../features/session/sessionContext';
import { LegalLayout } from '../components/templates/LegalLayout/LegalLayout';
import { Alert } from '../components/molecules/Alert/Alert';

/** Anbieterkennzeichnung; die Angaben stehen in der Server-.env (IMPRINT_*). */
export function ImprintPage() {
  const legal = useSession().status?.legal;
  const complete = Boolean(legal?.name && legal.street && legal.city);

  return (
    <LegalLayout title="Impressum">
      {!complete ? (
        <Alert tone="info">Die Anbieterangaben werden gerade eingerichtet.</Alert>
      ) : (
        <>
          <h2>Angaben gemäß § 5 DDG</h2>
          <address>
            {legal?.name}<br />
            {legal?.street}<br />
            {legal?.city}
          </address>
          {(legal?.email || legal?.phone) && (
            <>
              <h2>Kontakt</h2>
              <p>
                {legal?.email && <>E-Mail: <a href={`mailto:${legal.email}`}>{legal.email}</a><br /></>}
                {legal?.phone && <>Telefon: {legal.phone}</>}
              </p>
            </>
          )}
        </>
      )}
      <h2>Über KrautKompass</h2>
      <p>
        KrautKompass ist ein privates, nicht kommerzielles Bewertungstagebuch für eine kleine, eingeladene Runde.
        Es gibt keine Werbung, keinen Verkauf und keine Kaufempfehlungen. Die Bewertungen geben persönliche Eindrücke
        wieder und ersetzen keine ärztliche Beratung.
      </p>
      <p>Sortendaten und Produktbilder stammen aus dem öffentlichen Katalog des Kraut-Kurier-Shops.</p>
    </LegalLayout>
  );
}
