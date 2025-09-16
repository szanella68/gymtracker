# Istruzioni per Setup Documentazione GymTracker

## Obiettivo
Creare e organizzare la documentazione completa del progetto GymTracker in tre file principali nella cartella docs/ del repository.

## Percorso Base
Tutte le operazioni devono essere eseguite nella directory: `C:/filepubblici/gymtracker/`

## Operazioni da Eseguire

### 1. Verifica e Crea Struttura Cartelle

Verifica che esista la cartella `docs/`. Se non esiste, creala:

```
C:/filepubblici/gymtracker/docs/
```

### 2. Crea File: docs/01_mission_and_objectives.md

Crea il file `docs/01_mission_and_objectives.md` con il seguente contenuto esatto:

```markdown
# Mission e Obiettivi - GymTracker

Visione: Creare un ecosistema digitale completo per il fitness che colleghi personal trainer e clienti attraverso una piattaforma integrata, sicura e user-friendly.

## Mission Principale

GymTracker è un servizio di personal training digitale che mira a:

1. Democratizzare l'accesso al coaching professionale - Rendere il personal training di qualità accessibile a tutti
2. Ottimizzare la relazione trainer-cliente - Fornire strumenti digitali che potenziano l'interazione umana
3. Gamificare il fitness - Trasformare l'allenamento in un'esperienza coinvolgente e motivante
4. Creare continuità nel percorso fitness - Garantire follow-up costante e progressione strutturata

## Target Audience

### Clienti (Utilizzatori Finali)
- Principianti: Persone che iniziano il loro percorso fitness
- Intermedi: Chi vuole strutturare meglio i propri allenamenti
- Avanzati: Atleti che cercano programmazione professionale
- Recupero: Persone in riabilitazione o con esigenze speciali

### Trainer Professionali
- Personal Trainer certificati che vogliono digitalizzare il loro business
- Fisioterapisti che seguono percorsi di recupero
- Preparatori atletici per sport specifici
- Nutrizionisti per programmi integrati (futura espansione)

## Obiettivi del Servizio

### Per i Clienti
1. Onboarding Personalizzato
   - Registrazione con dati anagrafici e fitness
   - Assessment iniziale (livello, obiettivi, limitazioni)
   - Matching con trainer compatibile

2. Pianificazione Su Misura
   - Schede di allenamento personalizzate
   - Progressione graduale e sostenibile
   - Adattamento basato sui feedback

3. Monitoraggio Continuo
   - Tracking sessioni e progressi
   - Statistiche motivazionali
   - Comunicazione diretta con il trainer

### Per i Trainer
1. Gestione Clienti Centralizzata
   - Dashboard con overview tutti i clienti
   - Creazione e modifica schede
   - Monitoraggio aderenza ai programmi

2. Strumenti Professionali
   - Template di esercizi personalizzabili
   - Sistema di note e annotazioni
   - Report automatici sui progressi

3. Scalabilità del Business
   - Gestione multipli clienti simultaneamente
   - Automazione processi ripetitivi
   - Analytics per ottimizzare i servizi

## Architettura del Sistema

### Dual Interface Design

#### Lato Cliente (/utente/)
- Landing Page: Presentazione servizio e trainer "Nicola"
- Autenticazione: Login/Registrazione unificata
- Dashboard: Hub centrale con menu navigazione
- Profilo: Gestione dati personali e obiettivi
- Sessioni: Visualizzazione e tracking allenamenti
- Calendario: Pianificazione sessioni future
- Progressi: Charts e statistiche motivazionali

#### Lato Trainer (/trainer/)
- Dashboard Admin: Overview clienti e KPI
- Gestione Clienti: CRUD completo profili utenti
- Creazione Schede: Builder programmi allenamento
- Monitoring: Tracking adesione e risultati clienti
- Reports: Analisi performance e business metrics

### Flusso Utente Tipo

1. Nuovo Utente
2. Registrazione + Profilo
3. Assessment Trainer
4. Creazione Scheda Personalizzata
5. Notifica Cliente
6. Inizio Allenamenti
7. Tracking Progressi
8. Review Periodica
9. Aggiornamento Scheda
10. Ritorno al punto 6

## Value Proposition

### Per i Clienti
- Guidance Professionale: Schede create da trainer certificati
- Accessibilità: Costi inferiori al PT tradizionale
- Flessibilità: Allenamento quando e dove vuoi
- Motivazione: Gamification e tracking progressi
- Sicurezza: Esercizi appropriati per il tuo livello

### Per i Trainer
- Efficiency: Gestisci più clienti contemporaneamente
- Professional Tools: Dashboard e analytics avanzati
- Passive Income: Monetizza la tua expertise digitalmente
- Client Retention: Tools per mantenere engagement alto
- Growth: Scala il business oltre i limiti fisici

## Roadmap e Visione Futura

### Fase 1 (MVP Attuale)
- Sistema autenticazione dual-role
- Dashboard base trainer e cliente
- CRUD clienti e schede basic
- Tracking allenamenti completo
- Sistema calendario integrato

### Fase 2 (Enhancement)
- Mobile app nativa (React Native)
- Video esercizi integrati
- Chat trainer-cliente in tempo reale
- Sistema notifiche push
- Import dati da wearables (Fitbit, Apple Watch)

### Fase 3 (Scale)
- Marketplace trainer multipli
- AI-assisted program generation
- Integrazione nutrizionale
- Social features (community, challenges)
- Analytics avanzati e ML insights

### Fase 4 (Ecosystem)
- Partnership palestre fisiche
- Certificazioni trainer integrate
- Telehealth per fisioterapia
- Corporate wellness programs
- API per integration terze parti

## Brand Identity

### Trainer "Nicola"
- Personalità: Professionale, empatico, motivante
- Approach: Evidence-based, progressivo, sostenibile
- Specialità: Fitness generale, forza, ricomposizione corporea
- Filosofia: "Il miglior allenamento è quello che fai costantemente"

### Design Philosophy
- Clean & Minimal: Focus sui contenuti, no distrazioni
- Mobile-First: Responsive design per tutti i device
- Accessible: Usabile da tutti, incluse persone con disabilità
- Performance: Veloce, affidabile, offline-capable

## Success Metrics

### KPI Clienti
- Retention Rate: % clienti attivi dopo 3/6/12 mesi
- Adherence Rate: % allenamenti completati vs programmati
- Goal Achievement: % clienti che raggiungono obiettivi
- Satisfaction Score: Net Promoter Score (NPS)

### KPI Business
- Monthly Active Users (MAU)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Churn Rate
- Revenue per User (ARPU)

### KPI Trainer
- Client Load: Numero medio clienti per trainer
- Response Time: Tempo medio risposta a domande
- Program Effectiveness: Risultati medi clienti
- Trainer Satisfaction: Feedback interni sulla piattaforma

## Impatto Sociale

### Salute Pubblica
- Riduzione sedentarietà nella popolazione
- Prevenzione malattie cardiovascolari e metaboliche
- Miglioramento salute mentale attraverso l'esercizio
- Educazione su stili di vita sani

### Economia Digitale
- Creazione opportunità lavoro per trainer
- Democratizzazione accesso servizi fitness
- Innovazione nel settore wellness
- Supporto piccole imprese locali (palestre partner)

GymTracker: Where Technology Meets Human Expertise to Transform Lives Through Fitness
```

### 3. Crea File: docs/02_technical_structure.md

Crea il file `docs/02_technical_structure.md` con il seguente contenuto esatto:

```markdown
# Struttura Tecnica - GymTracker

Documentazione tecnica completa dell'architettura, configurazione e deployment del sistema GymTracker

## Stack Tecnologico

### Backend
- Runtime: Node.js (v16+)
- Framework: Express.js
- Authentication: Supabase Auth + JWT
- Database: PostgreSQL (via Supabase)
- File Storage: Supabase Storage
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
│   └── trainer.js               # Endpoint trainer admin
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
    │   ├── calendario.html      # Pianificazione (TODO)
    │   └── css/
    │       └── utente.css       # Stili interfaccia cliente
    │
    ├── trainer/                 # Interfaccia Trainer
    │   ├── dashboard.html       # Dashboard amministrativa
    │   ├── clienti.html         # Gestione clienti
    │   ├── schede.html          # Creazione schede (TODO)
    │   └── css/
    │       └── trainer.css      # Stili interfaccia trainer
    │
    └── shared/                  # Componenti condivisi
        ├── css/
        │   ├── shared.css       # Stili base comuni
        │   ├── menu-component.css # Stili menu navigazione
        │   └── responsive.css   # Media queries responsive
        │
        ├── js/
        │   └── core/
        │       ├── api.js       # Client API Supabase
        │       ├── auth.js      # Gestione autenticazione
        │       ├── utils.js     # Utilità generiche
        │       ├── template-loader.js # Sistema template
        │       └── menu.js      # Gestione menu navigazione
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

## Configurazione Server (server.js)

### Porte e Indirizzi
```javascript
const PORT = process.env.PORT || 3010;  // Porta Node.js
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

# API GymTracker → Node.js porta 3010
ProxyPass /gymtracker/api/ http://localhost:3010/api/
ProxyPassReverse /gymtracker/api/ http://localhost:3010/api/

# Headers per proxy (opzionale ma raccomandato)
ProxyPassMatch ^/gymtracker/api/(.*)$ http://localhost:3010/api/$1
ProxyPassReverseMatch ^/gymtracker/api/(.*)$ http://localhost:3010/api/$1
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

    # Proxy API GymTracker → Node.js porta 3010
    # IMPORTANTE: API specifiche PRIMA delle generiche!
    ProxyPass        /gymtracker/api/     http://localhost:3010/api/
    ProxyPassReverse /gymtracker/api/     http://localhost:3010/api/
    
    # Timeout configurazione per upload grandi
    ProxyTimeout 300
    
    # ===== ALTRE APPLICAZIONI (ordine importante!) =====
    
    # App ZanFlow (porta 3002)
    ProxyPass        /api/zanflow/       http://localhost:3002/api/zanflow/
    ProxyPassReverse /api/zanflow/       http://localhost:3002/api/zanflow/

    # App Nicola (porta 3010) - STESSO PORT di GymTracker!
    ProxyPass        /api/nicola/        http://localhost:3010/api/
    ProxyPassReverse /api/nicola/        http://localhost:3010/api/
    ProxyPass        /nicola/api/        http://localhost:3010/api/
    ProxyPassReverse /nicola/api/        http://localhost:3010/api/
    
    # Backend principale ZanMan (porta 3000)
    ProxyPass        /api/               http://localhost:3000/api/
    ProxyPassReverse /api/               http://localhost:3000/api/

    # UI ZanMan
    ProxyPass        /app1/              http://localhost:3000/
    ProxyPassReverse /app1/              http://localhost:3000/

    # UI Nicola
    ProxyPass        /nicola/            http://localhost:3010/
    ProxyPassReverse /nicola/            http://localhost:3010/

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
PORT=3010
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
3. Apache proxy a :3010/api/auth/login
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

echo Avvio server GymTracker sulla porta 3010...
echo.
echo URL Locale: http://localhost:3010
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
- Controlla porte libere: `netstat -an | findstr 3010`
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
```

### 4. Crea File: docs/03_database_schema.md

Crea il file `docs/03_database_schema.md` con il seguente contenuto esatto:

```markdown
# Database Schema - GymTracker Supabase

Documentazione completa dello schema database PostgreSQL su Supabase con Row Level Security (RLS)

## Overview Database

### Configurazione Supabase
- Project URL: `https://oyetlgzmnhdnjfucdtrj.supabase.co`
- Database: PostgreSQL 15+ con estensioni
- Authentication: Supabase Auth (JWT-based)
- Storage: Supabase Storage per file uploads
- Real-time: Abilitato per aggiornamenti live

### Sicurezza
- Row Level Security (RLS): Abilitato su tutte le tabelle
- API Keys: Anon Key (frontend) + Service Role Key (backend admin)
- Policies: Controllo accesso granulare per ruoli
- JWT Verification: Automatic token validation

## Schema Principale

### auth.users (Supabase Built-in)
```sql
-- Tabella gestita automaticamente da Supabase Auth
-- Non modificabile direttamente, solo via Auth API

auth.users {
  id: uuid (PRIMARY KEY)                 -- ID utente univoco
  email: text (UNIQUE)                   -- Email login
  encrypted_password: text               -- Password criptata
  email_confirmed_at: timestamp          -- Conferma email
  invited_at: timestamp                  -- Data invito
  confirmation_token: text               -- Token conferma
  confirmation_sent_at: timestamp        -- Invio conferma
  recovery_token: text                   -- Token recovery
  recovery_sent_at: timestamp            -- Invio recovery
  email_change_token: text               -- Token cambio email
  email_change: text                     -- Nuova email
  email_change_sent_at: timestamp        -- Invio cambio email
  last_sign_in_at: timestamp             -- Ultimo login
  raw_app_meta_data: jsonb               -- Metadata app
  raw_user_meta_data: jsonb              -- Metadata utente
  is_super_admin: boolean                -- Super admin flag
  created_at: timestamp                  -- Data creazione
  updated_at: timestamp                  -- Ultimo aggiornamento
  phone: text                            -- Telefono (opzionale)
  phone_confirmed_at: timestamp          -- Conferma telefono
  phone_change: text                     -- Cambio telefono
  phone_change_token: text               -- Token cambio telefono
  phone_change_sent_at: timestamp        -- Invio cambio telefono
  confirmed_at: timestamp                -- Data conferma generale
  email_change_confirm_status: integer   -- Status cambio email
  banned_until: timestamp                -- Ban temporaneo
  reauthentication_token: text           -- Token riautenticazione
  reauthentication_sent_at: timestamp    -- Invio riautenticazione
}
```

### Metadata Ruoli (raw_user_meta_data)
```json
{
  "role": "standard|admin",      // Ruolo utente
  "full_name": "Nome Cognome",   // Nome completo
  "avatar_url": "https://...",   // URL avatar
  "provider": "email",           // Provider autenticazione
  "providers": ["email"]         // Lista provider
}
```

## Tabelle Profili e Utenti

### user_profiles
```sql
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informazioni Personali
  full_name text,                        -- Nome completo
  phone text,                            -- Telefono
  date_of_birth date,                    -- Data nascita
  gender text CHECK (gender IN ('male','female','other')), -- Genere
  
  -- Misure Fisiche
  height_cm integer,                     -- Altezza in cm
  weight_kg real,                        -- Peso in kg
  
  -- Fitness & Obiettivi
  fitness_goal text,                     -- Obiettivo fitness
  experience_level text CHECK (experience_level IN ('beginner','intermediate','advanced')),
  
  -- Informazioni Mediche
  medical_notes text,                    -- Note mediche
  emergency_contact text,                -- Contatto emergenza
  
  -- Configurazione Account
  profile_picture_url text,              -- URL foto profilo
  utente_attivo boolean DEFAULT true,    -- Account attivo
  
  -- Timestamp
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_user_profiles_active ON user_profiles(utente_attivo);
CREATE INDEX idx_user_profiles_experience ON user_profiles(experience_level);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Utenti possono vedere/modificare solo il proprio profilo
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin possono gestire tutti i profili
CREATE POLICY "Admins can manage all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Trigger per aggiornamento automatico updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Tabelle Allenamenti

### schede (Workout Plans)
```sql
CREATE TABLE schede (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relazioni
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Informazioni Scheda
  titolo text NOT NULL,                  -- Nome scheda
  descrizione text,                      -- Descrizione dettagliata
  autore text DEFAULT 'Trainer Nicola', -- Chi ha creato la scheda
  
  -- Configurazione
  durata_settimane integer DEFAULT 4,   -- Durata in settimane
  sessioni_settimana integer DEFAULT 3, -- Sessioni per settimana
  attiva boolean DEFAULT true,          -- Scheda attiva
  cancellata boolean DEFAULT false,     -- Soft delete
  
  -- Note e Configurazione
  note text,                            -- Note trainer
  livello_difficolta text CHECK (livello_difficolta IN ('beginner','intermediate','advanced')),
  
  -- Timestamp
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_schede_user ON schede(user_id);
CREATE INDEX idx_schede_active ON schede(attiva, cancellata);
CREATE INDEX idx_schede_created ON schede(created_at);

-- RLS Policies
ALTER TABLE schede ENABLE ROW LEVEL SECURITY;

-- Utenti vedono solo le proprie schede
CREATE POLICY "Users can view own schede" ON schede
  FOR SELECT USING (auth.uid() = user_id);

-- Admin possono gestire tutte le schede
CREATE POLICY "Admins can manage all schede" ON schede
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Trigger updated_at
CREATE TRIGGER trg_schede_updated_at
  BEFORE UPDATE ON schede
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### sessioni (Workout Sessions)
```sql
CREATE TABLE sessioni (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relazioni
  scheda_id uuid NOT NULL REFERENCES schede(id) ON DELETE CASCADE,
  
  -- Informazioni Sessione
  nome text NOT NULL,                    -- Nome sessione (es: "Push Day", "Legs")
  descrizione text,                      -- Descrizione sessione
  giorno_settimana integer CHECK (giorno_settimana BETWEEN 1 AND 7), -- 1=Lunedì, 7=Domenica
  ordine_nella_scheda integer DEFAULT 1, -- Ordine nella scheda
  
  -- Configurazione
  durata_stimata_minuti integer,         -- Durata prevista
  note text,                            -- Note specifiche
  
  -- Timestamp
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_sessioni_scheda ON sessioni(scheda_id);
CREATE INDEX idx_sessioni_ordine ON sessioni(scheda_id, ordine_nella_scheda);
CREATE INDEX idx_sessioni_giorno ON sessioni(giorno_settimana);

-- RLS Policies
ALTER TABLE sessioni ENABLE ROW LEVEL SECURITY;

-- Utenti vedono sessioni delle proprie schede
CREATE POLICY "Users can view own sessioni" ON sessioni
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM schede 
      WHERE schede.id = sessioni.scheda_id 
      AND schede.user_id = auth.uid()
    )
  );

-- Admin possono gestire tutte le sessioni
CREATE POLICY "Admins can manage all sessioni" ON sessioni
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Trigger updated_at
CREATE TRIGGER trg_sessioni_updated_at
  BEFORE UPDATE ON sessioni
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### exercises (Esercizi)
```sql
CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relazioni
  sessione_id uuid NOT NULL REFERENCES sessioni(id) ON DELETE CASCADE,
  
  -- Informazioni Esercizio
  nome text NOT NULL,                    -- Nome esercizio
  descrizione text,                      -- Descrizione tecnica
  ordine_nella_sessione integer DEFAULT 1, -- Ordine nella sessione
  
  -- Configurazione Esercizio
  series integer NOT NULL DEFAULT 3,    -- Numero serie
  ripetizioni text,                      -- Ripetizioni (es: "8-12", "15", "AMRAP")
  peso_kg real,                          -- Peso suggerito
  recovery_seconds integer DEFAULT 90,   -- Recupero in secondi
  
  -- Nuovi Campi (Migrazione Gennaio 2025)
  intensity integer DEFAULT 0 CHECK (intensity >= 0 AND intensity <= 10), -- Intensità 0-10
  external_url text,                     -- Link video/tutorial
  
  -- Tipologia
  muscle_groups text,                    -- Gruppi muscolari (JSON array come text)
  equipment text,                        -- Attrezzatura necessaria
  
  -- Note
  note text,                            -- Note specifiche
  
  -- Timestamp
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_exercises_sessione ON exercises(sessione_id);
CREATE INDEX idx_exercises_ordine ON exercises(sessione_id, ordine_nella_sessione);
CREATE INDEX idx_exercises_muscle_groups ON exercises USING gin (to_tsvector('english', muscle_groups));

-- RLS Policies
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Utenti vedono esercizi delle proprie sessioni
CREATE POLICY "Users can view own exercises" ON exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessioni s
      JOIN schede sc ON s.scheda_id = sc.id
      WHERE s.id = exercises.sessione_id 
      AND sc.user_id = auth.uid()
    )
  );

-- Admin possono gestire tutti gli esercizi
CREATE POLICY "Admins can manage all exercises" ON exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Trigger updated_at
CREATE TRIGGER trg_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Tabelle Tracking e Progressi

### workout_logs (Log Allenamenti)
```sql
CREATE TABLE workout_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relazioni
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sessione_id uuid NOT NULL REFERENCES sessioni(id) ON DELETE CASCADE,
  
  -- Data Allenamento
  workout_date date NOT NULL DEFAULT current_date,
  start_time timestamp,                  -- Inizio esercizio
  end_time timestamp,                    -- Fine esercizio
  
  -- Performance
  series_completed integer DEFAULT 0,    -- Serie completate
  ripetizioni_completate text,           -- Ripetizioni per serie (JSON: ["12","10","8"])
  peso_utilizzato real,                  -- Peso realmente usato
  recovery_time_seconds integer,         -- Recupero effettivo
  
  -- Qualità e Feedback
  rpe integer CHECK (rpe BETWEEN 1 AND 10), -- Rate of Perceived Exertion
  difficulty_rating integer CHECK (difficulty_rating BETWEEN 1 AND 5), -- Difficoltà percepita
  form_quality integer CHECK (form_quality BETWEEN 1 AND 5), -- Qualità esecuzione
  
  -- Note
  note text,                            -- Note utente
  
  -- Timestamp
  created_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_workout_logs_user_date ON workout_logs(user_id, workout_date);
CREATE INDEX idx_workout_logs_exercise ON workout_logs(exercise_id);
CREATE INDEX idx_workout_logs_sessione ON workout_logs(sessione_id, workout_date);

-- RLS Policies
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- Utenti vedono solo i propri log
CREATE POLICY "Users can view own workout_logs" ON workout_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workout_logs" ON workout_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout_logs" ON workout_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin possono vedere tutti i log
CREATE POLICY "Admins can view all workout_logs" ON workout_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
```

## Tabelle Obiettivi e Pianificazione

### user_goals (Obiettivi Utente)
```sql
CREATE TABLE user_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relazioni
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Informazioni Obiettivo
  title text NOT NULL,                   -- Titolo obiettivo
  description text,                      -- Descrizione dettagliata
  
  -- Tipologia e Target
  target_type text CHECK (target_type IN ('weight','reps','time','distance','custom')) DEFAULT 'custom',
  target_value numeric,                  -- Valore target
  unit text,                            -- Unità di misura
  target_date date,                     -- Data target
  
  -- Status e Progresso
  status text CHECK (status IN ('pending','in_progress','completed','archived')) DEFAULT 'in_progress',
  progress_value numeric DEFAULT 0,      -- Valore attuale
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  
  -- Completamento
  completed_at timestamp,               -- Data completamento
  
  -- Timestamp
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_user_goals_user ON user_goals(user_id);
CREATE INDEX idx_user_goals_status ON user_goals(status);
CREATE INDEX idx_user_goals_target_date ON user_goals(target_date);

-- RLS Policies
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- Utenti gestiscono solo i propri obiettivi
CREATE POLICY "Users can manage own goals" ON user_goals
  FOR ALL USING (auth.uid() = user_id);

-- Admin possono vedere tutti gli obiettivi
CREATE POLICY "Admins can view all goals" ON user_goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Trigger updated_at
CREATE TRIGGER trg_user_goals_updated_at
  BEFORE UPDATE ON user_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### scheduled_sessions (Sessioni Calendarizzate)
```sql
CREATE TABLE scheduled_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relazioni
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  sessione_id uuid NOT NULL REFERENCES sessioni(id) ON DELETE CASCADE,
  
  -- Pianificazione
  scheduled_date date NOT NULL,          -- Data pianificata
  scheduled_time time,                   -- Ora pianificata (opzionale)
  
  -- Status
  status text CHECK (status IN ('scheduled','completed','skipped','rescheduled')) DEFAULT 'scheduled',
  completed_at timestamp,               -- Data completamento effettivo
  
  -- Note
  note text,                            -- Note specifiche
  
  -- Timestamp
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_scheduled_sessions_user_date ON scheduled_sessions(user_id, scheduled_date);
CREATE INDEX idx_scheduled_sessions_status ON scheduled_sessions(status);
CREATE UNIQUE INDEX uq_scheduled_sessions_user_session_date 
  ON scheduled_sessions(user_id, sessione_id, scheduled_date);

-- RLS Policies
ALTER TABLE scheduled_sessions ENABLE ROW LEVEL SECURITY;

-- Utenti gestiscono solo le proprie sessioni pianificate
CREATE POLICY "Users can manage own scheduled sessions" ON scheduled_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Admin possono vedere tutte le sessioni pianificate
CREATE POLICY "Admins can view all scheduled sessions" ON scheduled_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Trigger updated_at
CREATE TRIGGER trg_scheduled_sessions_updated_at
  BEFORE UPDATE ON scheduled_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Views e Query Utili

### View: User Workout Statistics
```sql
CREATE OR REPLACE VIEW user_workout_stats AS
SELECT 
  up.id as user_id,
  up.full_name,
  COUNT(DISTINCT wl.workout_date) as total_workout_days,
  COUNT(wl.id) as total_exercises_logged,
  AVG(wl.rpe) as avg_rpe,
  MAX(wl.workout_date) as last_workout_date,
  COUNT(DISTINCT CASE WHEN wl.workout_date >= current_date - interval '30 days' THEN wl.workout_date END) as workouts_last_30_days
FROM user_profiles up
LEFT JOIN workout_logs wl ON up.id = wl.user_id
GROUP BY up.id, up.full_name;
```

### View: Exercise Progress
```sql
CREATE OR REPLACE VIEW exercise_progress AS
SELECT 
  wl.user_id,
  e.nome as exercise_name,
  wl.workout_date,
  wl.peso_utilizzato,
  LAG(wl.peso_utilizzato) OVER (PARTITION BY wl.user_id, wl.exercise_id ORDER BY wl.workout_date) as previous_weight,
  wl.peso_utilizzato - LAG(wl.peso_utilizzato) OVER (PARTITION BY wl.user_id, wl.exercise_id ORDER BY wl.workout_date) as weight_progress
FROM workout_logs wl
JOIN exercises e ON wl.exercise_id = e.id
WHERE wl.peso_utilizzato IS NOT NULL
ORDER BY wl.user_id, e.nome, wl.workout_date;
```

## Operazioni di Manutenzione

### Script Verifica Integrità
```sql
-- Verifica esistenza tabelle principali
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'schede', 'sessioni', 'exercises', 'workout_logs');

-- Conteggio record per tabella
SELECT 
  'user_profiles' as table_name, COUNT(*) as record_count FROM user_profiles
UNION ALL
SELECT 'schede', COUNT(*) FROM schede
UNION ALL
SELECT 'sessioni', COUNT(*) FROM sessioni
UNION ALL
SELECT 'exercises', COUNT(*) FROM exercises
UNION ALL
SELECT 'workout_logs', COUNT(*) FROM workout_logs;

-- Verifica RLS abilitato
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'schede', 'sessioni', 'exercises', 'workout_logs');
```

### Cleanup Dati Vecchi
```sql
-- Rimuovi log workout più vecchi di 2 anni
DELETE FROM workout_logs 
WHERE workout_date < current_date - interval '2 years';

-- Soft delete schede non utilizzate da più di 6 mesi
UPDATE schede 
SET cancellata = true 
WHERE updated_at < current_date - interval '6 months' 
AND attiva = false
AND id NOT IN (
  SELECT DISTINCT scheda_id 
  FROM sessioni s 
  JOIN workout_logs wl ON s.id = wl.sessione_id 
  WHERE wl.workout_date > current_date - interval '6 months'
);
```

### Statistiche Performance
```sql
-- Query più lente (richiede pg_stat_statements)
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements 
WHERE query LIKE '%user_profiles%' OR query LIKE '%workout_logs%'
ORDER BY mean_time DESC 
LIMIT 10;

-- Dimensioni tabelle
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Migrazione e Backup

### Script Backup Completo
```bash
#!/bin/bash
# backup_gymtracker.sh

# Configurazione
SUPABASE_PROJECT="oyetlgzmnhdnjfucdtrj"
BACKUP_DIR="/backups/gymtracker"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup schema
pg_dump "postgresql://postgres:[PASSWORD]@db.${SUPABASE_PROJECT}.supabase.co:5432/postgres" \
  --schema-only \
  --no-owner \
  --no-privileges \
  > "${BACKUP_DIR}/schema_${DATE}.sql"

# Backup dati
pg_dump "postgresql://postgres:[PASSWORD]@db.${SUPABASE_PROJECT}.supabase.co:5432/postgres" \
  --data-only \
  --no-owner \
  --no-privileges \
  --table=user_profiles \
  --table=schede \
  --table=sessioni \
  --table=exercises \
  --table=workout_logs \
  > "${BACKUP_DIR}/data_${DATE}.sql"

echo "Backup completato: ${BACKUP_DIR}/{schema,data}_${DATE}.sql"
```

### Migration Patches
```sql
-- Patch 2025.01.15: Aggiungi campi intensity e external_url
ALTER TABLE exercises 
  ADD COLUMN IF NOT EXISTS intensity integer DEFAULT 0 CHECK (intensity >= 0 AND intensity <= 10),
  ADD COLUMN IF NOT EXISTS external_url text;

-- Patch 2025.01.20: Migliora indicizzazione workout_logs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workout_logs_user_exercise_date 
  ON workout_logs(user_id, exercise_id, workout_date);

-- Patch 2025.01.25: Aggiungi campo completion_percentage a user_goals
ALTER TABLE user_goals 
  ADD COLUMN IF NOT EXISTS completion_percentage integer DEFAULT 0 
  CHECK (completion_percentage >= 0 AND completion_percentage <= 100);
```

## Monitoring e Alerting

### Query Monitoraggio
```sql
-- Utenti attivi ultimi 7 giorni
SELECT COUNT(DISTINCT user_id) as active_users_7d
FROM workout_logs 
WHERE workout_date >= current_date - interval '7 days';

-- Schede create negli ultimi 30 giorni
SELECT COUNT(*) as new_schede_30d
FROM schede 
WHERE created_at >= current_date - interval '30 days';

-- Errori di integrità referenziale
SELECT 'Orphaned workout_logs' as issue, COUNT(*) as count
FROM workout_logs wl
LEFT JOIN user_profiles up ON wl.user_id = up.id
WHERE up.id IS NULL
UNION ALL
SELECT 'Orphaned exercises' as issue, COUNT(*) as count
FROM exercises e
LEFT JOIN sessioni s ON e.sessione_id = s.id
WHERE s.id IS NULL;
```

Questo schema database rappresenta la base solida e scalabile per il sistema GymTracker, progettato per crescere con le esigenze del business.
```

### 5. Aggiorna README.md Principale

Apri il file `README.md` esistente nella directory principale e aggiungi o sostituisci la sezione documentazione con:

```markdown
## Documentazione

### Per Stakeholder e Business
- [Mission e Obiettivi](docs/01_mission_and_objectives.md) - Vision, target audience, roadmap

### Per Developer e Tecnici  
- [Struttura Tecnica](docs/02_technical_structure.md) - Architettura, configurazione, deployment
- [Database Schema](docs/03_database_schema.md) - Schema Supabase, policies, query

### Documentazione Esistente
- [Deployment Guide](docs/deployment_guide.md) - Guida installazione
- [API Documentation](docs/api_documentation.md) - Endpoint e utilizzo
- [Contributing Guide](CONTRIBUTING.md) - Come contribuire
```

### 6. Crea File: docs/CHANGELOG.md

Crea il file `docs/CHANGELOG.md` con il seguente contenuto:

```markdown
# Changelog Documentazione GymTracker

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
- Configurazione Apache reverse proxy per porta 3010
- Integrazione Supabase con autenticazione JWT
- Struttura cartelle organizzata per scalabilità
- Script deployment automatizzati per Windows

### Database Schema
- Tabelle principali: user_profiles, schede, sessioni, exercises, workout_logs
- Row Level Security abilitato su tutte le tabelle
- Policies per separazione accesso cliente/trainer
- Views per statistiche e reporting
- Trigger automatici per timestamp updates
```

### 7. Verifica Struttura Finale

Dopo aver creato tutti i file, verifica che la struttura sia:

```
C:/filepubblici/gymtracker/
├── docs/
│   ├── 01_mission_and_objectives.md
│   ├── 02_technical_structure.md
│   ├── 03_database_schema.md
│   ├── CHANGELOG.md
│   ├── apache-config-example.conf (esistente)
│   ├── deployment_guide.md (esistente)
│   └── api_documentation.md (esistente)
├── README.md (aggiornato)
└── [altri file di progetto esistenti]
```

## Completamento

Una volta completate tutte le operazioni sopra elencate, la documentazione del progetto GymTracker sarà completamente organizzata e strutturata per facilitare manutenzione, onboarding di nuovi sviluppatori e gestione delle evoluzioni future del sistema.

I tre file principali coprono:
1. Vision e obiettivi di business
2. Implementazione tecnica e deployment  
3. Struttura database e query di utilità

La documentazione è ora autocontenuta, versionata e facilmente mantenibile nel tempo.