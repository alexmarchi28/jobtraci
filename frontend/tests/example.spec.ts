import { expect, test, type Page } from '@playwright/test';

type JobApplication = {
  id: number;
  company: string;
  role: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  contractType: string;
  status: string;
  applicationDate: string;
  contactName: string | null;
  postingUrl: string | null;
  notes: string | null;
};

const apiBaseUrl = 'http://localhost:5000/api';

function makeJob(overrides: Partial<JobApplication> = {}): JobApplication {
  /*
   * A small factory keeps test data readable.
   *
   * In Playwright you will often create test data in helpers instead of
   * repeating large objects in every test. The defaults describe a valid job;
   * each test overrides only the fields that matter for that scenario.
   */
  return {
    id: 1,
    company: 'Acme Testing',
    role: 'Junior QA Tester',
    location: 'Milano / Ibrido',
    salaryMin: 26000,
    salaryMax: 30000,
    contractType: 'Apprendistato',
    status: 'Candidatura inviata',
    applicationDate: '2026-05-15',
    contactName: 'HR Team',
    postingUrl: 'https://example.com/jobs/qa',
    notes: 'Dato mockato per un test Playwright.',
    ...overrides,
  };
}

async function mockJobsList(page: Page, jobs: JobApplication[]): Promise<void> {
  /*
   * `page.route` intercetta le chiamate di rete fatte dal browser.
   *
   * Qui stiamo dicendo: quando Angular chiede GET /api/jobs, non andare
   * davvero al backend; rispondi con questo array controllato dal test.
   *
   * Questo e' utilissimo per test UI deterministici:
   * - niente dipendenza dallo stato del database;
   * - niente dati "sporchi" lasciati da un test precedente;
   * - puoi simulare facilmente liste vuote, errori, stati specifici.
   */
  await page.route(`${apiBaseUrl}/jobs`, async (route) => {
    await route.fulfill({
      status: 200,
      json: jobs,
    });
  });
}

test.describe('JobTraci - primi test end-to-end con Playwright', () => {
  test('il backend parte tramite la configurazione webServer', async ({ request }) => {
    /*
     * Il fixture `request` e' un client HTTP di Playwright.
     *
     * Non apre una pagina nel browser: fa una richiesta diretta all'API.
     * E' comodo per preparare dati, pulire dati, o controllare che un servizio
     * sia vivo. In questo caso verifichiamo che il backend avviato da
     * playwright.config.ts risponda sull'endpoint di health check.
     */
    const response = await request.get(`${apiBaseUrl}/health`);

    await expect(response).toBeOK();

    const body = await response.json();
    expect(body).toMatchObject({
      status: 'ok',
      application: 'JobTracker.Api',
    });
  });

  test('mostra la home page e lo stato vuoto della lista candidature', async ({ page }) => {
    /*
     * Importante: il mock va registrato PRIMA di `page.goto`.
     *
     * La tua app Angular carica i job subito nel costruttore del componente.
     * Se registrassimo la route dopo la navigazione, la richiesta GET /api/jobs
     * potrebbe essere gia partita e il test diventerebbe intermittente.
     */
    await mockJobsList(page, []);

    /*
     * Grazie a `baseURL` nel config, `/` significa:
     * http://localhost:4200/
     */
    await page.goto('/');

    /*
     * `expect(page).toHaveTitle` e' una web-first assertion:
     * Playwright aspetta automaticamente per un breve tempo che la condizione
     * diventi vera. Questo riduce molto il bisogno di sleep manuali.
     */
    await expect(page).toHaveTitle(/JobTraci/);

    /*
     * Preferisci locator accessibili quando puoi:
     * - getByRole
     * - getByLabel
     * - getByText
     *
     * Sono piu vicini a come un utente o uno screen reader interpreta la UI,
     * e tendono a rompersi meno rispetto a selettori CSS troppo specifici.
     */
    await expect(page.getByRole('heading', { level: 1, name: 'Candidature' })).toBeVisible();
    await expect(page.getByText('Nessuna candidatura salvata.')).toBeVisible();
  });

  test('mostra un errore di validazione quando il form obbligatorio e vuoto', async ({ page }) => {
    await mockJobsList(page, []);
    await page.goto('/');

    /*
     * I locator possono usare espressioni regolari.
     * Qui il bottone contiene anche un testo secondario, quindi `/Nuova candidatura/`
     * e' piu flessibile del nome completo del bottone.
     */
    await page.getByRole('button', { name: /Nuova candidatura/ }).click();
    await page.getByRole('button', { name: 'Aggiungi offerta' }).click();

    /*
     * Questo test non controlla l'implementazione Angular del form.
     * Controlla il comportamento visibile per l'utente: dopo un submit non
     * valido appare un messaggio di errore.
     */
    await expect(
      page.getByText('Compila almeno azienda, ruolo, sede e data candidatura.'),
    ).toBeVisible();

    /*
     * `getByLabel` funziona perche nel template l'input e' dentro una <label>.
     * E' uno dei modi migliori per compilare form nei test E2E.
     */
    await expect(page.getByLabel('Azienda')).toHaveClass(/invalid/);
    await expect(page.getByLabel('Ruolo')).toHaveClass(/invalid/);
    await expect(page.getByLabel('Sede')).toHaveClass(/invalid/);
  });

  test('renderizza una lista di candidature ricevuta dalla API', async ({ page }) => {
    await mockJobsList(page, [
      makeJob({
        id: 10,
        company: 'Quality House',
        role: 'QA Automation Intern',
        status: 'Colloquio',
      }),
      makeJob({
        id: 11,
        company: 'Northwind Tech',
        role: 'Frontend Tester',
        status: 'Da valutare',
        contractType: 'Indeterminato',
      }),
    ]);

    await page.goto('/');

    /*
     * Qui stiamo verificando il risultato finale renderizzato, non il dettaglio
     * tecnico della chiamata HTTP. Un buon test E2E ragiona spesso cosi:
     * "dato questo stato del sistema, cosa dovrebbe vedere/fare l'utente?"
     */
    await expect(page.getByRole('heading', { name: 'QA Automation Intern' })).toBeVisible();
    await expect(page.getByText('Quality House')).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Frontend Tester' })).toBeVisible();
    await expect(page.getByText('Northwind Tech')).toBeVisible();

    /*
     * Quando un testo puo comparire piu volte, restringi il campo con un
     * locator padre. `filter({ hasText })` e' molto utile per trovare una card,
     * una riga tabella, o un pannello specifico.
     */
    const savedJobsMetric = page.locator('.metric-card').filter({ hasText: 'Offerte salvate' });
    await expect(savedJobsMetric.getByText('2')).toBeVisible();
  });

  test('compila il form e aggiunge una candidatura usando una risposta API mockata', async ({
    page,
  }) => {
    /*
     * In questo test mockiamo sia GET sia POST /api/jobs.
     *
     * La GET fa partire la pagina con lista vuota.
     * La POST simula il backend che crea una candidatura e restituisce l'oggetto
     * appena creato con un id. Angular poi aggiorna la lista usando quella
     * risposta, proprio come farebbe con il backend reale.
     */
    await page.route(`${apiBaseUrl}/jobs`, async (route) => {
      const request = route.request();

      if (request.method() === 'GET') {
        await route.fulfill({ status: 200, json: [] });
        return;
      }

      if (request.method() === 'POST') {
        const payload = request.postDataJSON() as Partial<JobApplication>;

        await route.fulfill({
          status: 201,
          json: makeJob({
            id: 101,
            company: payload.company,
            role: payload.role,
            location: payload.location,
            salaryMin: payload.salaryMin ?? null,
            salaryMax: payload.salaryMax ?? null,
            contractType: payload.contractType,
            status: payload.status,
            applicationDate: payload.applicationDate,
            contactName: payload.contactName ?? null,
            postingUrl: payload.postingUrl ?? null,
            notes: payload.notes ?? null,
          }),
        });
        return;
      }

      await route.fulfill({ status: 405, json: { message: 'Method not allowed in this test.' } });
    });

    await page.goto('/');
    await page.getByRole('button', { name: /Nuova candidatura/ }).click();

    /*
     * Playwright compila i campi come farebbe un utente:
     * fill per input/textarea, selectOption per select, click per bottoni.
     */
    await page.getByLabel('Azienda').fill('Cypress Labs');
    await page.getByLabel('Ruolo').fill('QA Engineer');
    await page.getByLabel('Sede').fill('Torino / Remoto');
    await page.getByLabel('Data candidatura').fill('2026-05-15');
    await page.getByLabel('Tipo contratto').selectOption('Indeterminato');

    /*
     * Nota pratica: `getByLabel('Stato')` puo essere ambiguo in questa pagina,
     * perche alcune option di "Tipo contratto" contengono la parola "stato"
     * dentro "Apprendistato". Quando un locator e' ambiguo, Playwright fallisce
     * apposta invece di cliccare "a caso": e' una protezione molto utile.
     *
     * Qui usiamo il formControlName come fallback tecnico. In un progetto reale
     * potresti anche migliorare markup/accessibilita o usare test id stabili.
     */
    await page.locator('select[formcontrolname="status"]').selectOption('Candidatura inviata');
    await page.getByLabel('Note').fill('Primo test di creazione con Playwright.');

    /*
     * Quando vuoi verificare una chiamata HTTP generata da un click, crea prima
     * la Promise con `waitForRequest`, poi fai l'azione.
     *
     * Questo evita race condition: su un browser veloce la request potrebbe
     * partire subito, su un browser piu lento qualche millisecondo dopo.
     */
    const createRequestPromise = page.waitForRequest(
      (request) => request.url() === `${apiBaseUrl}/jobs` && request.method() === 'POST',
    );

    await page.getByRole('button', { name: 'Aggiungi offerta' }).click();

    const createRequest = await createRequestPromise;
    const createdPayload = createRequest.postDataJSON() as Partial<JobApplication>;

    /*
     * Possiamo controllare sia cio che Angular ha inviato al backend mockato...
     */
    expect(createdPayload).toMatchObject({
      company: 'Cypress Labs',
      role: 'QA Engineer',
      location: 'Torino / Remoto',
      contractType: 'Indeterminato',
      status: 'Candidatura inviata',
    });

    /*
     * ...sia cio che l'utente vede dopo il salvataggio.
     * Questa seconda parte e' spesso la piu importante in un test E2E.
     */
    await expect(page.getByText('Offerta aggiunta: Cypress Labs - QA Engineer')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'QA Engineer' })).toBeVisible();

    /*
     * "Cypress Labs" appare sia nel messaggio di successo sia nella card.
     * Quando un testo non e' unico, crea prima un locator piu piccolo e poi
     * cerca dentro quello. Questo evita strict mode violation.
     */
    const createdCard = page.locator('.job-card').filter({ hasText: 'QA Engineer' });
    await expect(createdCard.getByText('Cypress Labs', { exact: true })).toBeVisible();
  });

  test('accetta il dialog di conferma ed elimina una candidatura dalla UI', async ({ page }) => {
    const jobToDelete = makeJob({
      id: 77,
      company: 'Delete Me Ltd',
      role: 'Automation QA',
    });

    await page.route(`${apiBaseUrl}/jobs`, async (route) => {
      await route.fulfill({ status: 200, json: [jobToDelete] });
    });

    await page.route(`${apiBaseUrl}/jobs/${jobToDelete.id}`, async (route) => {
      /*
       * Il backend reale risponde 204 No Content per una DELETE riuscita.
       * Riprodurre status code realistici rende i mock piu fedeli al sistema.
       */
      await route.fulfill({ status: 204 });
    });

    await page.goto('/');

    const jobCard = page.locator('.job-card').filter({ hasText: 'Delete Me Ltd' });
    await expect(jobCard).toBeVisible();

    /*
     * I bottoni modifica/elimina appaiono solo in hover.
     * Playwright puo simulare anche questo tipo di interazione.
     */
    await jobCard.hover();

    /*
     * `page.once('dialog', ...)` registra un handler per il prossimo dialog JS.
     * Senza questo handler, un `confirm()` bloccherebbe il test.
     */
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Automation QA');
      await dialog.accept();
    });

    await jobCard.getByRole('button', { name: 'Elimina offerta' }).click();

    await expect(page.getByText('Offerta eliminata: Delete Me Ltd - Automation QA')).toBeVisible();
    await expect(jobCard).toHaveCount(0);
  });
});
