# Struttura Tecnica - GymTracker

Documentazione tecnica completa dell'architettura, configurazione e deployment del sistema GymTracker

## Stack Tecnologico

### Backend
- Runtime: Node.js (v16+)
- Framework: Express.js
- Authentication: Supabase Auth + JWT
- Database: PostgreSQL (via Supabase)
- File Storage: Supabase Storage
- Webhooks: N8N Integration + Custom Service
- Hosting: Windows Server + XAMPP

### Frontend
- Architecture: Static HTML/CSS/JS (no framework)
- UI Components: Custom modular system
- Build Tool: None (vanilla deployment)
- Styling: CSS3 + CSS Grid/Flexbox
- Icons: Font Awesome

### Infrastructure
- Web Server: Apache 2.4 (XAMPP)
- Reverse Proxy: Apache ProxyPass/ProxyPassReverse
- SSL Certificates: Let's Encrypt (via win-acme)
- Domain: zanserver.sytes.net (No-IP Dynamic DNS)
- CORS: Configurato per dominio specifico

## Struttura delle Cartelle

```
C:/filepubblici/gymtracker/
├── server.js                    # Entry point server Express
├── package.json                 # Dipendenze Node.js
├── package-lock.json            # Lock versioni dipendenze
├── .env                         # Variabili ambiente (SECRET!)
├── .env.example                 # Template variabili ambiente
├── .gitignore                   # File esclusi da Git
├── README.md                    # Documentazione principale
├── CONTRIBUTING.md              # Guida contributori
│
├── config/
│   └── supabase.js              # Client e configurazione Supabase
│
├── middleware/
│   └── auth.js                  # Middleware autenticazione JWT
│
├── routes/
│   ├── auth.js                  # Endpoint autenticazione
│   ├── users.js                 # Endpoint gestione utenti
│   ├── trainer.js               # Endpoint trainer admin
│   └── admin.js                 # Endpoint admin specifici
│
├── scripts/
│   ├── start_gymtracker.bat     # Script avvio Node.js (Windows)
│   ├── start_apache.bat         # Script avvio Apache
│   └── start_server.bat         # Script avvio completo
│
├── docs/
│   ├── apache-config-example.conf  # Template configurazione Apache
│   ├── deployment_guide.md      # Guida deployment
│   └── api_documentation.md     # Documentazione API
│
└── public/                      # Frontend statico
    ├── index.html               # Landing page principale
    ├── .htaccess                # Configurazione Apache locale
    │
    ├── utente/                  # Interfaccia Cliente
    │   ├── index.html           # Login/Registrazione
    │   ├── dashboard.html       # Dashboard principale
    │   ├── profilo.html         # Gestione profilo
    │   ├── sessioni.html        # Gestione allenamenti
    │   ├── calendario.html      # Pianificazione allenamenti (COMPLETATA)
    │   ├── goals.html           # Gestione obiettivi fitness
    │   ├── report.html          # Report e statistiche
    │   └── css/
    │       └── utente.css       # Stili interfaccia cliente
    │
    ├── trainer/                 # Interfaccia Trainer
    │   ├── dashboard.html       # Dashboard amministrativa
    │   ├── clienti.html         # Gestione clienti
    │   ├── schede.html          # Creazione/gestione schede (COMPLETATA)
    │   ├── calendario.html      # Sistema calendario allenamenti
    │   ├── profilo.html         # Gestione profili clienti
    │   └── css/
    │       └── trainer.css      # Stili interfaccia trainer
    │
    └── shared/                  # Componenti condivisi
        ├── css/
        │   └── shared.css       # Stili base comuni UNIFICATI (include tutto)
        │
        ├── js/
        │   ├── core/
        │   │   ├── api.js       # Client API Supabase
        │   │   └── utils.js     # Utilità generiche
        │   ├── include.js       # Sistema template e inclusioni
        │   ├── auth-supabase.js # Gestione autenticazione Supabase
        │   └── webhooks.js      # Sistema notifiche webhook (NUOVO)
        │
        ├── partials/
        │   ├── header.html      # Header comune
        │   ├── footer.html      # Footer comune
        │   └── menu.html        # Menu navigazione
        │
        └── images/
            ├── logo.png         # Logo principale
            └── favicon.ico      # Icona browser
```

## Sistemi Aggiunti e Miglioramenti (2025)

### Sistema Webhook N8N
- **File**: `services/webhookService.js`
- **Scopo**: Integrazione con N8N per automazioni e notifiche
- **Eventi supportati**: 
  - `user.preregistered` - Nuovo utente registrato (profilo incompleto)
  - `user.registered` - Profilo utente completato
  - `user.activated` - Utente attivato dal trainer/admin
  - `user.deactivated` - Utente disattivato
  - `event.newscheda` - Nuova scheda allenamento attivata

### Sistema Notifiche Frontend
- **File**: `public/shared/js/webhooks.js`
- **Scopo**: Notifiche popup per conferma invio webhook
- **Funzioni**: `showWebhookNotification()`, `handleWebhookResult()`
- **Stili**: Notifiche animate con auto-dismiss

### CSS Unificato e Standardizzazione Button
- **Stato**: Sistema CSS completamente ristrutturato (2025)
- **File principale**: `public/shared/css/shared.css` - Sistema button centralizzato
- **Alias semantici**: `.btn-add`, `.btn-save`, `.btn-delete`, `.btn-cancel` - Colori funzionali
- **Modificatori**: `.btn-with-icon`, `.btn-sm`, `.btn-lg`, `.btn-block` - Size e stile
- **File locali**: `trainer/css/trainer.css`, `utente/css/utente.css` - Solo stili specifici
- **Context Menu**: Calendario trainer con dual functionality (drag-drop + right-click)
- **Styling uniformato**: Calendari utente e trainer con identico aspetto visivo
- **Status Progress**: 🟡 IN CORSO - Sistema 46% migrato con inconsistenze risolte
- **Prossimi Steps**: Definire classi semantic in shared.css, eliminare duplicazioni
- **Miglioramenti**: 
  - Unified component system
  - Consistent spacing e typography
  - Modern gradient designs
  - Responsive grid layouts
  - Sistema di notifiche webhook integrate

### Database Schema Aggiornamenti
- **Nuove tabelle**: `user_goals`, `scheduled_sessions` implementate
- **Campi aggiunti**: `exercises.intensity`, `exercises.external_url`
- **Webhook metadata**: Tutti gli endpoint ora ritornano risultati webhook

## Configurazione Server (server.js)

### Porte e Indirizzi
```javascript
const PORT = process.env.PORT || 3010;  // Porta Node.js (AGGIORNATA da 3007)
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://zanserver.sytes.net';
```

### Middleware Configurati
```javascript
// CORS per dominio specifico
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));

// Parsing JSON e URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serving static files (frontend)
app.use(express.static('public'));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/admin', adminRoutes);  // NUOVO: Endpoint admin specifici
```

### Health Check
```javascript
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'gymtracker-api',
    version: '1.0.0'
  });
});
```

## Configurazione Apache

### httpd.conf - Configurazione Principale

```apache
# ==========================================
# CONFIGURAZIONE GYMTRACKER - httpd.conf
# ==========================================

# Abilita moduli necessari
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule headers_module modules/mod_headers.so

# Configurazione per GymTracker
<VirtualHost *:80>
    ServerName zanserver.sytes.net
    DocumentRoot "C:/xampp/htdocs"
    
    # Redirect HTTP → HTTPS
    Redirect permanent / https://zanserver.sytes.net/
</VirtualHost>

# Alias per file statici GymTracker
Alias /gymtracker "C:/filepubblici/gymtracker/public"
<Directory "C:/filepubblici/gymtracker/public">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
    DirectoryIndex index.html
    
    # Configurazione cache per performance
    <FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 month"
    </FilesMatch>
</Directory>

# Proxy per API GymTracker (backend Node.js)
ProxyPreserveHost On
ProxyRequests Off

<Proxy *>
    Require all granted
</Proxy>

# API GymTracker → Node.js porta 3007
ProxyPass /gymtracker/api/ http://localhost:3007/api/
ProxyPassReverse /gymtracker/api/ http://localhost:3007/api/

# Headers per proxy (opzionale ma raccomandato)
ProxyPassMatch ^/gymtracker/api/(.*)$ http://localhost:3007/api/$1
ProxyPassReverseMatch ^/gymtracker/api/(.*)$ http://localhost:3007/api/$1
```

### httpd-ssl.conf - Configurazione HTTPS

```apache
# ==========================================
# CONFIGURAZIONE SSL - httpd-ssl.conf
# ==========================================

<VirtualHost *:443>
    ServerName zanserver.sytes.net
    DocumentRoot "C:/xampp/htdocs"

    # ===== CERTIFICATI SSL (Let's Encrypt via win-acme) =====
    SSLEngine on
    SSLCertificateFile      "C:/ProgramData/win-acme/acme-v02.api.letsencrypt.org/zanserver.sytes.net-crt.pem"
    SSLCertificateKeyFile   "C:/ProgramData/win-acme/acme-v02.api.letsencrypt.org/zanserver.sytes.net-key.pem"
    SSLCertificateChainFile "C:/ProgramData/win-acme/acme-v02.api.letsencrypt.org/zanserver.sytes.net-chain.pem"

    # Configurazione SSL avanzata
    SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384
    SSLHonorCipherOrder on

    # ===== HEADERS PER REVERSE PROXY =====
    ProxyPreserveHost On
    ProxyRequests Off
    
    # Headers forwarded per app dietro proxy
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port  "443"
    RequestHeader set X-Forwarded-Host  %{HTTP_HOST}s

    <Proxy *>
        Require all granted
    </Proxy>

    <Location />
        Require all granted
    </Location>

    # ===== CONFIGURAZIONE GYMTRACKER =====
    
    # Serve file statici direttamente da Apache
    Alias /gymtracker "C:/filepubblici/gymtracker/public"
    <Directory "C:/filepubblici/gymtracker/public">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        DirectoryIndex index.html
        
        # Gestione SPA - rewrite per client-side routing
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^(.*)$ index.html [L]
    </Directory>

    # Proxy API GymTracker → Node.js porta 3007
    # IMPORTANTE: API specifiche PRIMA delle generiche!
    ProxyPass        /gymtracker/api/     http://localhost:3007/api/
    ProxyPassReverse /gymtracker/api/     http://localhost:3007/api/
    
    # Timeout configurazione per upload grandi
    ProxyTimeout 300
    
    # ===== ALTRE APPLICAZIONI (ordine importante!) =====
    
    # App ZanFlow (porta 3002)
    ProxyPass        /api/zanflow/       http://localhost:3002/api/zanflow/
    ProxyPassReverse /api/zanflow/       http://localhost:3002/api/zanflow/

    # App Nicola (porta 3007) - STESSO PORT di GymTracker!
    ProxyPass        /api/nicola/        http://localhost:3007/api/
    ProxyPassReverse /api/nicola/        http://localhost:3007/api/
    ProxyPass        /nicola/api/        http://localhost:3007/api/
    ProxyPassReverse /nicola/api/        http://localhost:3007/api/
    
    # Backend principale ZanMan (porta 3000)
    ProxyPass        /api/               http://localhost:3000/api/
    ProxyPassReverse /api/               http://localhost:3000/api/

    # UI ZanMan
    ProxyPass        /app1/              http://localhost:3000/
    ProxyPassReverse /app1/              http://localhost:3000/

    # UI Nicola
    ProxyPass        /nicola/            http://localhost:3007/
    ProxyPassReverse /nicola/            http://localhost:3007/

    # ===== LOGS =====
    ErrorLog "C:/xampp/apache/logs/ssl_error.log"
    CustomLog "C:/xampp/apache/logs/ssl_access.log" combined
</VirtualHost>
```

## Configurazione Ambiente (.env)

```bash
# ==========================================
# VARIABILI AMBIENTE - .env
# ==========================================

# Configurazione Server
NODE_ENV=production
PORT=3007
CORS_ORIGIN=https://zanserver.sytes.net

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-256-bits-minimum
JWT_EXPIRES_IN=7d

# Database (se servisse connessione diretta)
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres

# Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_PATH=./uploads

# Email Configuration (per future notifiche)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Analytics (opzionale)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Debug
DEBUG=gymtracker:*
LOG_LEVEL=info
```

## Flussi di Comunicazione

### Frontend → Backend → Database

1. Browser Client invia richiesta HTTPS
2. Apache Server riceve richiesta
3. Apache proxy pass a Node.js Express
4. Node.js comunica con Supabase PostgreSQL
5. Node.js comunica con Supabase Auth
6. Node.js comunica con Supabase Storage
7. Response ritorna attraverso la catena

### Flusso Autenticazione

1. User compila Login Form
2. Frontend invia POST /gymtracker/api/auth/login
3. Apache proxy a :3007/api/auth/login
4. Node.js autentica con Supabase
5. Supabase ritorna JWT + User Data
6. Node.js risponde con JSON
7. Apache proxy risposta
8. Frontend riceve risposta e redirect a Dashboard
9. JWT viene memorizzato in localStorage
10. Per pagine protette: Frontend invia richiesta con JWT
11. Apache proxy con Authorization header
12. Node.js verifica JWT con Middleware
13. Node.js query dati utente da Supabase
14. Response con dati utente

### Flusso Gestione Allenamenti

1. Cliente fa login
2. Accede a Dashboard Cliente
3. Visualizza Schede disponibili
4. Seleziona Allenamento
5. Traccia Esercizi
6. Salva Progressi
7. Update Database

Parallelo Trainer:
1. Trainer fa login
2. Accede a Dashboard Trainer
3. Visualizza Lista Clienti
4. Seleziona Cliente specifico
5. Visualizza Progressi cliente
6. Modifica Scheda se necessario
7. Salva Modifiche
8. Sistema notifica Cliente

## Integrazione Database (Supabase)

### Client Configuration

```javascript
// config/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client per frontend (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Client per backend admin (service role)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

### Gestione Ruoli Admin

**IMPORTANTE:** Il sistema determina i ruoli admin tramite i **user metadata** di Supabase, non tramite campi database personalizzati.

#### Come Creare un Admin

Per rendere un utente admin, aggiungi il campo `role: "admin"` nei user metadata di Supabase:

1. **Via Dashboard Supabase:**
   - Vai su Authentication > Users
   - Seleziona l'utente
   - In "User Metadata" aggiungi: `{"role": "admin"}`

2. **Via API (per automazione):**
```javascript
// Usando service role key
await supabaseAdmin.auth.admin.updateUserById(userId, {
  user_metadata: { role: 'admin' }
});
```

3. **Via SQL (Supabase SQL Editor):**
```sql
-- Aggiorna metadata per un utente specifico
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@example.com';
```

#### Verifica Ruolo Admin

Il sistema controlla il ruolo in `middleware/auth.js`:

```javascript
// Estrae ruolo dai metadata utente
const userMetadataRole = user.user_metadata?.role;
const role = userMetadataRole === 'admin' ? 'admin' : 'standard';
```

#### Routing Basato su Ruoli

- **Admin** (`role: "admin"`) → `/gymtracker/trainer/dashboard.html`
- **Standard** (default) → `/gymtracker/utente/dashboard.html`

### Row Level Security (RLS)

```sql
-- Abilitazione RLS su tutte le tabelle
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schede ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- Policy per user_profiles: utenti vedono solo il proprio profilo
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy per schede: clienti vedono solo le proprie
CREATE POLICY "Users can view own schede" ON schede
    FOR SELECT USING (auth.uid() = user_id);

-- Policy per trainer: accesso admin a tutto
-- IMPORTANTE: Usa raw_user_meta_data invece di auth.users.admin
CREATE POLICY "Trainers can manage all data" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );
```

## Script di Deployment

### start_gymtracker.bat

```batch
@echo off
echo ==========================================
echo   AVVIO GYMTRACKER SERVER
echo ==========================================

cd /d "C:\filepubblici\gymtracker"

echo Verifico che Node.js sia installato...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRORE: Node.js non trovato!
    echo Installa Node.js da https://nodejs.org/
    pause
    exit /b 1
)

echo Verifico dipendenze...
if not exist "node_modules" (
    echo Installo dipendenze npm...
    call npm install
)

echo Verifico file .env...
if not exist ".env" (
    echo ERRORE: File .env non trovato!
    echo Copia .env.example in .env e configura le variabili
    pause
    exit /b 1
)

echo Avvio server GymTracker sulla porta 3007...
echo.
echo URL Locale: http://localhost:3007
echo URL Pubblico: https://zanserver.sytes.net/gymtracker/
echo.
echo Premi Ctrl+C per arrestare il server
echo ==========================================

node server.js
```

### start_apache.bat

```batch
@echo off
echo ==========================================
echo   AVVIO APACHE XAMPP
echo ==========================================

echo Verifico se Apache è già in esecuzione...
tasklist /FI "IMAGENAME eq httpd.exe" 2>NUL | find /I /N "httpd.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Apache è già in esecuzione!
    goto :end
)

echo Avvio Apache...
net start apache2.4
if errorlevel 1 (
    echo ERRORE: Impossibile avviare Apache!
    echo Verifica la configurazione o usa XAMPP Control Panel
    pause
    exit /b 1
)

echo Apache avviato con successo!
echo URL: https://zanserver.sytes.net/

:end
pause
```

### start_server.bat

```batch
@echo off
echo ==========================================
echo   AVVIO COMPLETO GYMTRACKER STACK
echo ==========================================

echo Fase 1: Avvio Apache...
call start_apache.bat

echo.
echo Fase 2: Avvio Node.js GymTracker...
call start_gymtracker.bat

echo.
echo ==========================================
echo   GYMTRACKER STACK AVVIATO!
echo ==========================================
echo Frontend: https://zanserver.sytes.net/gymtracker/
echo API Health: https://zanserver.sytes.net/gymtracker/api/health
echo ==========================================

pause
```

## Testing e Debugging

### Health Check URLs

```bash
# API Health Check
curl https://zanserver.sytes.net/gymtracker/api/health

# Test CORS
curl -H "Origin: https://zanserver.sytes.net" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://zanserver.sytes.net/gymtracker/api/health

# Test Authentication
curl -X POST https://zanserver.sytes.net/gymtracker/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
```

### Checklist Troubleshooting

#### Server Non Raggiungibile
- Verifica Apache sia avviato: `net start apache2.4`
- Verifica Node.js sia avviato: `tasklist | findstr node`
- Controlla porte libere: `netstat -an | findstr 3007`
- Verifica DNS No-IP sia aggiornato
- Controlla firewall Windows

#### Errori API
- Verifica configurazione .env
- Controlla connessione Supabase
- Verifica CORS configuration
- Controlla logs Apache: `C:/xampp/apache/logs/error.log`
- Controlla output console Node.js

#### Errori Database
- Verifica URL Supabase in .env
- Controlla API keys Supabase
- Verifica RLS policies
- Controlla schema database aggiornato

#### Problemi Ruoli Admin
- **Admin non riconosciuto**: Controlla user metadata in Supabase Dashboard
- **Redirect errato**: Verifica console browser per log frontend
- **Log verifiche**: Controlla console Node.js per processo autenticazione
- **Metadata mancanti**: Usa SQL per aggiungere `{"role": "admin"}` ai metadata

## Performance e Monitoraggio

### Ottimizzazioni Implementate

```apache
# Cache Headers in .htaccess
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
    Header append Cache-Control "public, immutable"
</FilesMatch>

# Compressione Gzip
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

### Metriche da Monitorare

- Response Time: API < 200ms, Static < 50ms
- Uptime: > 99.9%
- Memory Usage: Node.js < 512MB
- CPU Usage: < 80% under load
- Disk Space: > 10% free
- SSL Certificate: Renewal 30 giorni prima scadenza

Questa documentazione è il riferimento tecnico completo per deployment, configurazione e manutenzione del sistema GymTracker.