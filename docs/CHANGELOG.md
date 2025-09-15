# Changelog Documentazione GymTracker

## [1.2.1] - 2025-09-11 (UPDATE)

### Added  
- **Context Menu System**: Right-click menu per inserimento sessioni calendario trainer
- **Mobile Long-Press**: Support per 600ms long-press su dispositivi touch
- **Dual Functionality**: Mantenuto drag-and-drop + nuovo context menu
- **Calendar Visual Sync**: Utente e trainer calendari con styling identico
- **Event Pills**: Sessioni si espandono per riempire spazio disponibile (flex: 1)

### Progress CSS Unification
- **Button System**: 46% migrazione completata con alias semantici
- **Semantic Classes**: .btn-add, .btn-save, .btn-delete, .btn-cancel implementati
- **Modifiers**: .btn-with-icon, .btn-sm, .btn-lg, .btn-block standardizzati
- **Color Consistency**: Riduzione da 6 a 3 colori principali
- **File Updated**: 6/13 pagine migrate al nuovo sistema

### Documentation Updates
- **02_technical_structure.md**: Rimossi riferimenti file CSS inesistenti
- **04_piano_miglioramenti.md**: Aggiornato progress CSS unification
- Corretta struttura shared/css/ nella documentazione

## [1.2.0] - 2025-09-11

### Added
- **Sistema Webhook N8N**: Integrazione completa con N8N per automazioni
- **Sistema Notifiche Frontend**: Popup di conferma per tutti gli eventi webhook
- **File webhookService.js**: Servizio centralizzato per gestione webhook
- **File webhooks.js**: Libreria frontend per notifiche
- **Routes admin.js**: Endpoint amministrativi dedicati
- **Utilities admin.js**: Funzioni di supporto amministrativo

### Changed
- **PORTA SERVER**: Cambiata da 3007 a 3010 
- **CSS Architecture**: Sistema completamente ristrutturato in shared.css unificato
- **Database Schema**: Aggiunti campi intensity e external_url alle tabelle exercises
- **Webhook Integration**: Tutti gli endpoint API ora restituiscono risultati webhook

### Fixed
- Aggiornata struttura file e cartelle per riflettere stato reale
- Corretta porta server nella documentazione
- Eliminati riferimenti a file CSS non esistenti dalla documentazione

## [1.0.1] - 2025-09-10

### Changed
- **BREAKING CHANGE**: Sistema autenticazione admin ora usa user metadata invece di tabella auth.users
- Documentazione tecnica aggiornata con sezione "Gestione Ruoli Admin" 
- Aggiunta sezione troubleshooting per problemi ruoli admin

### Technical Changes
- `middleware/auth.js`: Controllo ruolo da `user.user_metadata.role` invece di `auth.users.admin`
- Frontend: Log dettagliati per debugging redirect admin
- Risolto problema 404 su endpoint `auth.users` non accessibile via REST

### Fixed
- Risolto redirect admin che portava sempre a dashboard cliente
- Admin ora correttamente reindirizzato a `/trainer/dashboard.html`

## [1.0.0] - 2025-01-15

### Added
- Documentazione completa mission e obiettivi del progetto
- Struttura tecnica dettagliata con configurazione Apache e deployment
- Schema database completo con Row Level Security policies
- Sistema di versioning per documentazione
- Organizzazione strutturata in cartella docs/

### Structure
- 01_mission_and_objectives.md - Vision e obiettivi business
- 02_technical_structure.md - Architettura e configurazione tecnica  
- 03_database_schema.md - Schema Supabase e query di utilità
- CHANGELOG.md - Tracking modifiche documentazione

### Technical Details
- Configurazione Apache reverse proxy per porta 3007
- Integrazione Supabase con autenticazione JWT
- Struttura cartelle organizzata per scalabilità
- Script deployment automatizzati per Windows

### Database Schema
- Tabelle principali: user_profiles, schede, sessioni, exercises, workout_logs
- Row Level Security abilitato su tutte le tabelle
- Policies per separazione accesso cliente/trainer
- Views per statistiche e reporting
- Trigger automatici per timestamp updates