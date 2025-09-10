# Changelog Documentazione GymTracker

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