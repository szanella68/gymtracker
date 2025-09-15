# UI Styleguide e Standardizzazione Stile (GymTracker)

Obiettivo: ridurre la complessità e centralizzare lo stile. Tutte le pagine devono usare i componenti e gli alias definiti in `public/shared/css/shared.css`, evitando CSS locali se non strettamente necessari.

## Token e Componenti Centrali

- Bottoni (alias semantici)
  - `btn-add` → Azioni di aggiunta/"+" (verde)
  - `btn-save` → Salvataggi/conferme (verde)
  - `btn-cancel` → Annulla/chiudi (ambra)
  - `btn-delete` → Eliminazioni (rosso)
  - `btn-blue` → Navigazione/azioni neutre
  - Modificatori: `btn-with-icon`, `btn-sm`, `btn-lg`, `btn-block`, `btn-icon`
- Tabs
  - `.profile-tabs` + `.profile-tab` (attivo blu, testo bianco)
- Pannelli e card
  - `.card`, `.card-header`
  - Alias: `.profile-card`, `.card-header-profile`, `.plans-section`, `.section-header`, `.session-card`, `.session-header`
- Tabelle e stati vuoti
  - `.table`
  - `.empty-state`, `.empty-icon`

## Mappatura Bottoni per Pagina (post‑standardizzazione)

### Trainer
- `trainer/dashboard.html` → `btn-add` (Crea Cliente)
- `trainer/clienti.html` → `btn-blue` (Schede/Calendario/Profili)
- `trainer/calendario.html` → `btn-blue` (◀ ▶ Oggi), `btn-add` (Estendi), `btn-delete` (Elimina da data)
- `trainer/profilo.html` → `btn-cancel` (Torna/Ripristina), `btn-save` (Salva); tabs blu
- `trainer/schede.html` → `btn-add` (Nuova/Crea/➕ Esercizio), `btn-save` (Salva), `btn-delete` (Elimina), `btn-cancel` (Annulla), `btn-sm` per azioni in lista

### Utente
- `utente/index.html` → `btn-save` (Accedi/Registrati), `btn-secondary` (Google)
- `utente/dashboard.html` → `btn-blue` (Visualizza Calendario/Riprova)
- `utente/calendario.html` → `btn-blue` (◀ ▶), `btn-amber` (Oggi), `btn-save` (Inizia/Salva tutto/Completa), `btn-blue` (Copia valori)
- `utente/profilo.html` → `btn-save` (Salva Modifiche/Obiettivi/Password), `btn-outline-emerald` (Logout completo); tabs blu
- `utente/goals.html` → `btn-add` (Aggiungi), `btn-blue btn-sm` (Modifica/Progresso), `btn-delete btn-sm` (Elimina), `btn-save` (Crea/Salva)
- `utente/report.html` → `btn-blue` (Esporta), `btn-save btn-block` (Salva Misurazione)
- `utente/schede.html` → `btn-blue` (Riprova)

## Titoli (gerarchie)
- Pagina: `h1`
- Sezioni principali: `h2`
- Sezioni interne/cornici: `h3`/`h4`

## Regole d’Uso rapide
- CTA con emoji/simbolo → aggiungere `btn-with-icon` (es. "💾 Salva", "➕ Aggiungi").
- Evitare gradient/border personalizzati locali: usare alias.
- Per panel/header usare le classi centralizzate; i layout locali devono essere minimali (grid/spacing).

## Residui CSS locali da tenere d’occhio
- `trainer/calendario.html`: layout e micro‑stili del calendario (specifici della pagina — OK, ma evitare stili di bottoni locali).
- `utente/schede.html`: decorazioni speciali (banda verde nella `section-header`) — opzionale mantenerla; tutto il resto è centralizzato.

## Checklist PR Stile (usare per nuove pagine)
1. Bottoni: usa alias semantici + `btn-with-icon` sulle CTA.
2. Tabs: `.profile-tabs`/`.profile-tab`.
3. Pannelli/card: `.card`/`.card-header` oppure alias `.plans-section`/`.section-header`/`.session-card`.
4. Tabelle/stati vuoti: `.table`, `.empty-state`/`.empty-icon`.
5. Titoli: `h1/h2/h3` coerenti.
6. Nessun CSS locale per bottoni; niente gradient personalizzati.

Questo documento è il riferimento per mantenere lo stile coerente e centralizzato.
