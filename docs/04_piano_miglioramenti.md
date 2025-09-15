# Piano Strutturato: Incongruenze, Migliorie e Semplificazione

Obiettivo: allineare documentazione, portare coerenza tra codice e configurazioni, semplificare l’architettura (frontend, backend, DB), ridurre debito tecnico e preparare il progetto a scalabilità e manutenzione.

## Approccio e Priorità

1) Soft (stile, naming, doc, coerenza) — impatto alto, rischio basso
2) Medio (config, sicurezza, contratti API, schema DB) — impatto alto, rischio medio
3) Difficile/Strutturale (refactor codice, consolidamento CSS, validazione) — impatto molto alto, rischio più alto

---

## Checklist Sintetica

- [ ] Allineare porta server/proxy (3010 ↔ 3007) e documentazione
- [x] **COMPLETATO** Ripulire e unificare la documentazione (README, docs/*)
- [ ] Definire standard naming (IT/EN) coerenti su codice e DB
- [x] **PARZIALE** Consolidare CSS - Sistema button unificato in shared.css (46% completato)
- [ ] Uniformare schema Supabase ai nomi e ai campi documentati
- [ ] Uniformare risposta API ed error handling
- [ ] Introdurre lint/format (ESLint/Prettier) e EditorConfig
- [ ] Introdurre validazione input (es. Zod/Joi) su endpoint principali
- [ ] Estrarre logica ripetuta in servizi (service layer) per ridurre duplicazioni nelle route

## Progress Updates (Settembre 2025)

### ✅ CSS Unification Achievement
- **Sistema Button Centralizzato**: Alias semantici implementati (btn-add, btn-save, btn-delete, btn-cancel)
- **Context Menu**: Right-click functionality su calendario trainer (dual mode con drag-drop)
- **Visual Consistency**: Calendari utente e trainer allineati visivamente
- **File Structure**: shared.css come sistema centrale, trainer.css/utente.css ridotti
- **Status**: 🟡 46% completato con ~60% inconsistenze risolte

---

## 1) Soft – Stile, Naming, Documentazione (Settimana 0–1)

1. Documentazione e README allineati alla realtà
   - Aggiornare `README.md` eliminando riferimenti non corretti:
     - Rimuovere SQLite (backend usa Supabase Postgres) e vecchie sezioni legacy.
     - Correggere `PORT` predefinita (attuale `server.js` usa 3010).
     - Aggiornare struttura file (esistono `services/webhookService.js`, `routes/admin.js`, `public/shared/js/*`).
     - Allineare elenco documenti presenti in `docs/` (01/02/03 + CHANGELOG, non esiste `apache-config-example.conf` nel root).
   - Correggere in `docs/02_technical_structure.md`:
     - Sezione Apache/ProxyPass: puntare alla porta effettiva scelta (vedi punto 2.1).
     - Rimuovere riferimenti a CSS non presenti (es. `menu-component.css`, `responsive.css`).
   - Mantenere coerenza con `CHANGELOG.md` (porta e CSS unificato già citati).

2. Standard di naming (lingua e coerenza)
   - Decisione: adottare inglese per nomi tecnici (tabelle, campi DB, API) e italiano per UI testuale.
   - Pianificare migrazione graduale: es. tabella `esercizi` → `exercises` con vista/alias temporaneo per compatibilità.
   - Uniformare nomi campi (es. `scheduled_date` vs `date`, `intensity`, `external_url`).

3. Stile di codice e formattazione
   - Aggiungere ESLint + Prettier + EditorConfig (regole base: semi, quote, indentazione, trailing commas, ecc.).
   - Husky (opzionale) per pre-commit lint/format.

4. **✅ COMPLETATO PARZIALE** Struttura CSS e guida stile
   - Definire Styleguide CSS (BEM, scale tipografiche, palette, spacing, tokens).
   - **ACHIEVEMENT**: Sistema button unificato con alias semantici implementato
   - **NEXT**: Completare migrazione rimanenti 54% classi button e definire token design system 
   - Documentare che `public/shared/css/shared.css` è la base; `trainer.css`/`utente.css` diventano overlay minimi o vengono fusi.

Deliverable: README aggiornato, docs allineate, styleguide CSS, baseline lint/format.

---

## 2) Medio – Config, Sicurezza, Contratti API, Schema DB (Settimana 1–2)

1. Porte e Proxy (allineamento 3010/3007)
   - Scegliere una porta unica per il backend (proposta: 3010, coerente con `server.js` e script `.bat`).
   - Aggiornare snippet Apache in `docs/02_technical_structure.md` a `ProxyPass /gymtracker/api/ http://localhost:3010/api/`.
   - Validare con health-check: `curl https://zanserver.sytes.net/gymtracker/api/health`.

2. CORS e Trust Proxy
   - Ridurre ambiguità: documentare origin consentiti e motivazioni (localhost 3010/3007 se davvero necessari in dev).
   - Verificare `app.set('trust proxy', 1)` coerente con Apache su stessa macchina.

3. Contratti API e error handling uniformi
   - Definire envelope risposta standard: `{ success, data?, error?, code? }`.
   - Aggiungere middleware `asyncHandler` e un error builder condiviso.
   - Documentare in `docs/api_documentation.md` (sezione “Response format”).

4. Schema Supabase – allineamento a documentazione
   - Coerenza tabelle/indici/policy:
     - `esercizi` vs `exercises`: introdurre vista `exercises` → tabella `esercizi`; migrazione di rinomina in fase 3.
     - `scheduled_sessions`: uniformare a `scheduled_date`/`scheduled_time` (in `config/supabase.js` oggi è `date`).
     - Aggiungere `completion_percentage` a `user_goals` (documentato in `docs/03_database_schema.md`).
   - Evitare mutate su `auth.users` (colonna `admin`): ruoli via `raw_user_meta_data.role` come da docs.

5. Sicurezza
   - Rate limit già presente: documentare livelli e percorsi protetti.
   - Convalidare CORS, Helmet, e ridurre superfici esposte.

Deliverable: snippet Apache corretto, policy DB chiarite, contratti API documentati e coerenti, supabase schema allineato.

---

## 3) Difficile – Refactor, Consolidamento CSS, Validazione (Settimana 2–4)

1. Service layer e refactor route
   - Estrarre logica Supabase ripetuta in moduli `services/` (es. `userService`, `trainerService`).
   - Snellire `routes/users.js` e `routes/trainer.js` spostando business logic in servizi.
   - Unificare formati di risposta ed errori.

2. Validazione input
   - Introdurre Zod/Joi per validare payload su endpoint sensibili (auth, profilo, schede, sessioni, log allenamenti).
   - Restituire errori 400 con dettaglio campo.

3. Consolidamento CSS
   - Inventariare regole duplicate tra `trainer.css` e `utente.css` e fonderle in `shared.css`.
   - Mantenere solo overlay di contesto leggeri (es. `trainer.overrides.css`, `utente.overrides.css`) se indispensabili.
   - Aggiornare inclusioni nelle pagine e la documentazione conseguente.

4. Osservabilità e logging
   - Introdurre logger (es. pino) con livelli configurabili.
   - Correlazione richiesta (request id) e log strutturati.

Deliverable: route più piccole e manutenibili, validazione coerente, CSS semplificato e documentato, logging migliorato.

---

## 4) Migrazioni e Compatibilità DB (Ongoing, coordinato)

1. `esercizi` → `exercises`
   - Fase A: creare vista `exercises` su `esercizi` + adattare codice alle viste.
   - Fase B: migrare dati e rinominare tabella fuori orario lavoro; aggiornare FK/indici.

2. `scheduled_sessions`
   - Allineare colonne a `scheduled_date`/`scheduled_time` e aggiornare codice e indici.

3. Policy RLS
   - Verifica policy admin basata su `raw_user_meta_data->>'role' = 'admin'` (già documentata) ovunque coerente.

Deliverable: schema pulito e coerente con la documentazione, zero rotture per i client.

---

## 5) Semplificazione Codice: interventi mirati

- Config centralizzata: modulo `config/index.js` che legge `.env`, valida e espone config tipizzata.
- Middleware riusabili: `asyncHandler`, `requireAdmin`, `requireAuth`, `validateBody(schema)`.
- Client Supabase unico con funzioni helper; rimuovere codice duplicato per query semplici.
- Response helpers: `ok(data)`, `created(data)`, `badRequest(error)`, `unauthorized()`, `forbidden()`, `notFound()`.
- Riduzione superficie pubblica: evitare endpoint superflui, aggregare funzioni simili.

---

## Rischi e Mitigazioni

- Rischio di regressioni su refactor route → Mitigazione: test manuali guidati + Postman collection.
- Cambi schema DB → Migrazioni incrementali + viste di compatibilità + backup.
- Allineamento Apache/porta → Eseguire una validazione in staging (o finestra notturna) e avere rollback.

---

## Definizione di Done (per fase)

- Soft: README e docs coerenti, lint/format attivi, styleguide CSS pubblicata.
- Medio: Porta e proxy allineati, contratti API documentati, schema Supabase coerente e senza hack su `auth.users`.
- Difficile: Service layer introdotto, validazione input operativa, CSS consolidato, logging strutturato.

---

## Sequenza Consigliata (executive)

1. Soft cleanup (doc + lint + naming) → commit
2. Porta/proxy + CORS + contratti API → commit
3. DB alignment (scheduled_sessions + goals + viste exercises) → commit
4. Refactor service layer + validazione input → commit
5. Consolidamento CSS + rimozione duplicati → commit
6. Logging strutturato + finiture → commit

Note operative: mantenere CHANGELOG aggiornato, usare PR piccole e mirate, validare ogni step con health-check/API e uno smoke test UI.

