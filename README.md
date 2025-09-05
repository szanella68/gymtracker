# 🏋️ GymTracker - Dual Interface Fitness Management System

Un sistema completo per la gestione di palestre con interfacce separate per clienti e trainer, basato su Node.js + SQLite + Apache.

## 🎯 Caratteristiche Principali

### 👤 **Interfaccia Cliente**
- Dashboard personalizzato con statistiche motivazionali
- Sistema di autenticazione unificato (login/registrazione)
- Profilo personale con obiettivi fitness
- Calendario allenamenti (futuro)
- Report progressi (futuro)

### 🧑‍🏫 **Interfaccia Trainer**
- Dashboard amministrativo professionale
- Gestione clienti completa
- Creazione di nuovi clienti con credenziali temporanee
- Statistiche aggregate sui clienti
- Controllo accessi basato su ruoli

### 🔒 **Sicurezza e Autenticazione**
- JWT tokens per sessioni sicure
- Gestione ruoli (standard/admin)
- Hashing password con bcrypt
- Protezione CORS configurabile
- Logout da tutti i dispositivi

## 📁 Struttura del Progetto

```
gymtracker/
├── 📄 server.js                    # Server Express principale
├── 📄 package.json                 # Dipendenze Node.js
├── 📄 .env                         # Configurazione ambiente
├── 📄 start_gymtracker.bat         # Script avvio automatico
├── 📄 apache-config-example.conf   # Configurazione Apache
├── 📄 apache_implementation_guide.md # Guida implementazione
│
├── 🗂️ config/
│   └── database.js                 # Configurazione database SQLite
│
├── 🗂️ routes/
│   ├── auth.js                     # API autenticazione
│   └── users.js                    # API gestione utenti
│
├── 🗂️ middleware/
│   └── auth.js                     # Middleware autenticazione JWT
│
├── 🗂️ database/
│   └── gymtracker.db               # Database SQLite (auto-creato)
│
└── 🗂️ public/                      # Frontend statico
    ├── index.html                  # Redirect pagina principale
    ├── .htaccess                   # Configurazione Apache
    │
    ├── 🗂️ utente/                  # Interfaccia Cliente
    │   ├── index.html              # Login/Register unificato
    │   ├── dashboard.html          # Dashboard cliente
    │   ├── profilo.html            # Profilo personale
    │   └── css/utente.css          # Stili cliente
    │
    ├── 🗂️ trainer/                 # Interfaccia Trainer
    │   ├── dashboard.html          # Dashboard trainer
    │   └── css/trainer.css         # Stili trainer
    │
    └── 🗂️ shared/                  # Componenti condivisi
        ├── css/shared.css          # Stili base
        └── js/core/
            ├── api.js              # Client API JavaScript
            └── utils.js            # Utilità JavaScript
```

## 🚀 Installazione e Avvio

### Prerequisiti
- **Node.js** (versione 16+)
- **Apache** (con moduli rewrite, proxy, headers)
- **Windows** (per script .bat, adattabile a Linux)

### Installazione
1. **Clonare o copiare i file** nella directory `C:/FilePubblici/gymtracker/`

2. **Configurare Apache** aggiungendo al `httpd.conf`:
   ```apache
   # Includi configurazione dall'esempio fornito
   Include "C:/FilePubblici/gymtracker/apache-config-example.conf"
   ```

3. **Avviare il sistema**:
   ```bash
   # Metodo 1: Script automatico (Windows)
   start_gymtracker.bat
   
   # Metodo 2: Manuale
   npm install
   npm run dev
   ```

### Configurazione Ambiente
Modifica il file `.env` secondo le tue necessità:
```env
PORT=3007
JWT_SECRET=your-super-secure-jwt-secret
DATABASE_PATH=./database/gymtracker.db
FRONTEND_URL=https://zanserver.sytes.net
```

## 🔗 URL e Accessi

| Funzione | URL | Descrizione |
|----------|-----|-------------|
| **Login Principale** | `/gymtracker/` | Pagina login unificata |
| **Dashboard Cliente** | `/gymtracker/utente/dashboard.html` | Interfaccia client |
| **Dashboard Trainer** | `/gymtracker/trainer/dashboard.html` | Interfaccia admin |
| **API Health** | `/gymtracker/api/health` | Controllo stato backend |

### Credenziali di Default
- **Admin**: `admin@gymtracker.local` / `admin123`
- **Nuovi utenti**: registrazione automatica come clienti

## 🛠️ API Endpoints

### Autenticazione
```javascript
POST /api/auth/register    // Registrazione nuovo utente
POST /api/auth/login       // Login utente
POST /api/auth/logout      // Logout singolo dispositivo
POST /api/auth/logout-all  // Logout tutti dispositivi
POST /api/auth/refresh     // Refresh token JWT
```

### Gestione Utenti
```javascript
GET  /api/users/me         // Profilo utente corrente
PUT  /api/users/me         // Aggiorna profilo
PUT  /api/users/me/password // Cambia password
GET  /api/users/me/stats   // Statistiche utente (dashboard)

// Solo Admin
GET  /api/users            // Lista tutti utenti
GET  /api/users/:id        // Dettagli utente specifico
PUT  /api/users/:id        // Aggiorna utente (admin)
```

## 🎨 Caratteristiche Tecniche

### Frontend
- **Vanilla JavaScript** (no framework dependencies)
- **Responsive Design** (mobile-first)
- **Client API** centralizzato con gestione errori
- **JWT Storage** sicuro con controlli scadenza
- **CORS** configurato per cross-origin requests

### Backend
- **Express.js** con middleware sicurezza
- **SQLite** database leggero e portatile
- **JWT** per autenticazione stateless
- **bcrypt** per hashing password sicuro
- **Rate Limiting** per protezione API

### Sicurezza
- **HTTPS** ready (configurazione SSL inclusa)
- **XSS Protection** con escape HTML
- **CSRF** protection tramite token validation
- **File Access** protection (.env, .db, etc.)
- **Role-based** access control

## 🔧 Personalizzazione

### Aggiungere nuovi Admin
Modifica direttamente il database SQLite:
```sql
UPDATE users SET user_type = 'admin' WHERE email = 'trainer@example.com';
```

### Colori e Stili
- **Cliente**: Colori motivazionali (verde, blu, arancione)
- **Trainer**: Colori professionali (grigio scuro, viola, nero)
- **Personalizzabili**: Modifica i file CSS nelle rispettive cartelle

### Estensioni Future
- Sistema calendario con booking
- Chat trainer-cliente integrata
- Report avanzati con grafici
- Export dati in PDF/Excel
- Integrazione pagamenti
- App mobile companion

## 📊 Database Schema

### Tabelle Principali
- `users` - Utenti del sistema
- `user_profiles` - Profili dettagliati
- `user_sessions` - Sessioni JWT attive
- `workout_programs` - Programmi allenamento
- `workout_sessions` - Sessioni specifiche
- `exercises` - Database esercizi
- `workout_logs` - Log esecuzione esercizi

## 🐛 Troubleshooting

### Problemi Comuni
1. **Node.js non trovato**: Installare da https://nodejs.org
2. **Apache non parte**: Verificare configurazione e porte libere
3. **CORS errors**: Controllare configurazione domini in .env
4. **Database locked**: Chiudere connessioni SQLite aperte
5. **JWT expired**: Refresh automatico gestito dal frontend

### Debug
```bash
# Controllare log Node.js
npm run dev

# Verificare API health
curl http://localhost:3007/api/health

# Test connessione database
node -e "require('./config/database').initDatabase()"
```

## 📝 Sviluppo

### Aggiungere nuove funzionalità
1. **Backend**: Creare route in `routes/` + middleware se necessario
2. **Frontend**: Aggiungere pagine in `public/utente/` o `public/trainer/`
3. **Database**: Modificare schema in `config/database.js`
4. **Stili**: Estendere CSS in cartelle appropriate

### Testing
```bash
# Test API endpoints
npm test  # (da implementare)

# Test manuale frontend
# Aprire https://zanserver.sytes.net/gymtracker/
```

## 📜 Licenza

MIT License - Usa e modifica liberamente per progetti personali e commerciali.

---

**Sviluppato con ❤️ per una gestione palestra moderna ed efficiente**