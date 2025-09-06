# 🏋️ GymTracker - Migrazione da Nicola
## Files Bat, Configurazioni Apache, Database e .env

---

## 📁 DIRECTORY STRUCTURE AGGIORNATA

```
📁 C:/filepubblici/gymtracker/
├── 🛠️ server.js               # Server Node.js principal
├── 📦 package.json            # Dependencies
├── 🔒 .env                    # Environment variables
├── 🗃️ database.sql            # Schema database
├── 📁 routes/                 # API endpoints
├── 📁 public/                 # Frontend files
│   ├── 📁 utente/            # Interfaccia clienti
│   ├── 📁 trainer/           # Interfaccia trainer
│   └── 📁 shared/            # Componenti condivisi
├── 🚀 start_server.bat       # Avvio completo
├── 🚀 start_apache.bat       # Solo Apache
├── 🚀 start_gymtracker.bat   # Solo Node.js
├── 🛑 stop_server.bat        # Stop wrapper
├── 🛑 stop_core.bat          # Stop Node.js
└── 📤 gitload.bat            # Git sync
```

---

## 🚀 FILES BAT AGGIORNATI

### **File: `start_apache.bat`**
```batch
@echo on
setlocal EnableExtensions

rem --- PERCORSI APACHE (XAMPP) ---
set "APACHE_BIN=C:\xampp\apache\bin\httpd.exe"
set "APACHE_CONF=C:\xampp\apache\conf\httpd.conf"
set "APACHE_ROOT=C:\xampp\apache"
set "APACHE_LOGS=C:\xampp\apache\logs"

if not exist "%APACHE_BIN%" (
  echo [ERRORE] Apache non trovato: %APACHE_BIN%
  goto HOLD
)

echo [TEST] Sintassi...
"%APACHE_BIN%" -t -f "%APACHE_CONF%"
if errorlevel 1 goto HOLD

rem --- evita doppio avvio: controlla la 443 ---
netstat -ano | findstr /r /c:":443 .*LISTENING" >nul
if not errorlevel 1 (
  echo [Apache] gia' attivo su :443. Niente rilancio.
  goto HOLD
)

echo -----------------------------------------
echo [RUN] Apache in FOREGROUND (Ctrl+C per fermare)
echo (errori runtime visibili qui; la finestra resta aperta)
echo -----------------------------------------
"%APACHE_BIN%" -f "%APACHE_CONF%" -d "%APACHE_ROOT%" -e info -E "%APACHE_LOGS%\startup-guard.log"
echo [EXIT] Codice: %errorlevel%

:HOLD
echo.
echo (Apache-SSL) Finestra bloccata. Premi un tasto per chiudere...
pause >nul
endlocal
```

### **File: `start_gymtracker.bat`**
```batch
@echo on
setlocal EnableExtensions

rem === PERCORSO GYMTRACKER ===
set "GYMTRACKER_DIR=C:\filepubblici\gymtracker"
set "GYMTRACKER_PORT=3007"

cd /d "%GYMTRACKER_DIR%"

where node
if errorlevel 1 (
  echo [ERRORE] Node.js non nel PATH.
  goto HOLD
)

rem evita doppio avvio: se 3007 gia' in LISTENING non rilancia
netstat -ano | findstr /r /c:":%GYMTRACKER_PORT% .*LISTENING" >nul
if not errorlevel 1 (
  echo [GymTracker] gia' attivo su :%GYMTRACKER_PORT%. Niente rilancio.
  goto HOLD
)

rem Carica variabili da .env se esiste
if exist ".env" (
  echo Caricamento variabili da .env...
  for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
    if not "%%a"=="" if not "%%b"=="" set "%%a=%%b"
  )
)

rem Fallback se non definite in .env
if not defined PORT set "PORT=%GYMTRACKER_PORT%"
if not defined NODE_ENV set "NODE_ENV=production"
if not defined FRONTEND_URL set "FRONTEND_URL=https://zanserver.sytes.net"

echo -----------------------------------------
echo [RUN] GYMTRACKER PRODUZIONE su porta %PORT%
echo Environment: %NODE_ENV%
echo Frontend URL: %FRONTEND_URL%
echo -----------------------------------------
node -v
echo Avvio server.js...
node server.js
echo [EXIT] Codice: %errorlevel%

:HOLD
echo.
echo (GymTracker) Finestra bloccata. Premi un tasto per chiudere...
pause >nul
endlocal
```

### **File: `start_server.bat`**
```batch
@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ================================================
echo  🏋️ GYMTRACKER LAUNCH: Apache + Node.js
echo ================================================

rem --- avvia Apache in foreground ---
start "Apache-SSL" cmd /k "%cd%\start_apache.bat"

rem --- aspetta un momento per Apache ---
timeout /t 3 /nobreak

rem --- avvia GymTracker Node.js ---
start "GymTracker PROD" cmd /k "%cd%\start_gymtracker.bat"

echo.
echo ✅ Finestre lanciate:
echo  - Apache-SSL (porta 443)
echo  - GymTracker (porta 3007)
echo.
echo 🌐 Accesso: https://zanserver.sytes.net/gymtracker/
echo.
echo Premi un tasto per aprire il browser...
pause
start https://zanserver.sytes.net/gymtracker/
endlocal
```

### **File: `stop_core.bat`**
```batch
@echo on
setlocal EnableExtensions
cd /d "%~dp0"

echo ===========================
echo  🛑 STOP GYMTRACKER (porta 3007)
echo ===========================

set "PORT=3007"
set "PID="
set "PROC="

rem -- Trova il PID che ascolta su 3007 --
for /f "tokens=5" %%A in ('netstat -ano ^| findstr /r /c:":%PORT% .*LISTENING"') do set "PID=%%A"

if not defined PID (
  echo [GymTracker] nessun processo in ascolto su :%PORT%.
  goto VERIFY
)

rem -- Identifica il processo (node/npm) --
tasklist /fi "PID eq %PID%" | findstr /i "node.exe" >nul && set "PROC=node.exe"
tasklist /fi "PID eq %PID%" | findstr /i "npm.exe"  >nul && set "PROC=npm.exe"
if not defined PROC set "PROC=PID %PID%"

echo [GymTracker] arresto %PROC% (PID %PID%)...
taskkill /PID %PID% /T /F >nul 2>&1
if errorlevel 1 (
  echo  - warning: taskkill ha restituito un errore.
) else (
  echo  ✅ OK terminato.
)

:VERIFY
echo.
echo [VERIFY]
netstat -ano | findstr /r /c:":%PORT% .*LISTENING" >nul && (
  echo  - porta %PORT% ANCORA in ascolto.
) || (
  echo  ✅ porta %PORT% libera.
)

echo.
echo ==== 🛑 STOP COMPLETATO ====
pause >nul
endlocal
```

### **File: `stop_server.bat`**
```batch
@echo off
cd /d "%~dp0"
echo 🛑 Arresto GymTracker...
start "STOP GYMTRACKER" cmd /k "%~dp0stop_core.bat"
```

### **File: `gitload.bat`**
```batch
@echo off
setlocal enabledelayedexpansion

:: === Config GymTracker ===
set "REPO_DIR=C:\filepubblici\gymtracker"

cd /d "%REPO_DIR%" || (echo Repo non trovata: %REPO_DIR% & pause & exit /b 1)
for /f "delims=" %%x in ('git rev-parse --is-inside-work-tree 2^>nul') do set INSIDE=%%x
if not "%INSIDE%"=="true" (echo Non e' una repo Git. & pause & exit /b 1)

echo ===== 🏋️ GYMTRACKER GIT SYNC =====

:: Crea .gitkeep nelle directory vuote (escluse .git e node_modules)
for /f "delims=" %%D in ('dir /ad /b /s') do (
  set "name=%%~nxD"
  if /i not "!name!"==".git" if /i not "!name!"=="node_modules" (
    dir "%%D\*" /a-d /b >nul 2>&1 || (echo.>"%%D\.gitkeep")
  )
)

echo Aggiungo tutte le modifiche...
git add -A

:: Verifica se ci sono cambi staged
set "HAVECHANGES="
git diff --cached --quiet || set "HAVECHANGES=1"

if defined HAVECHANGES (
  set "commit_msg="
  set /p commit_msg="Messaggio commit (default: gymtracker update): "
  if not defined commit_msg set "commit_msg=gymtracker update"
  git commit -m "!commit_msg!" || (echo Commit fallito. & pause & exit /b 1)
) else (
  echo Nessuna modifica da commitare.
)

for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set "BRANCH=%%b"
if not defined BRANCH set "BRANCH=main"

:: Se il branch remoto non esiste, crea upstream; altrimenti rebase+push
git ls-remote --exit-code --heads origin %BRANCH% >nul 2>&1
if errorlevel 1 (
  echo Creo upstream su origin/%BRANCH%...
  git push -u origin %BRANCH% || (echo Push fallito. & pause & exit /b 1)
) else (
  echo Pull --rebase da origin/%BRANCH%...
  git pull --rebase origin %BRANCH% || (echo Conflitti: risolvili e rilancia. & pause & exit /b 1)
  echo Push su origin/%BRANCH%...
  git push origin %BRANCH% || (echo Push fallito. & pause & exit /b 1)
)

echo.
echo ✅ Allineamento completato.
git status -sb
pause
```

---

## 🔒 FILE .ENV

### **File: `.env`**
```env
# GymTracker Environment Configuration
NODE_ENV=production
PORT=3007

# URLs
FRONTEND_URL=https://zanserver.sytes.net
API_BASE_URL=https://zanserver.sytes.net/gymtracker/api

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Security
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=https://zanserver.sytes.net

# Database
DB_CONNECTION_STRING=postgresql://user:password@host:port/database

# Email (if needed)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# File Upload
MAX_FILE_SIZE=10mb
UPLOAD_DIR=./uploads

# Session
SESSION_SECRET=your_session_secret_here

# Development
DEBUG=gymtracker:*
LOG_LEVEL=info

# SSL/TLS
SSL_CERT_PATH=C:/ProgramData/win-acme/acme-v02.api.letsencrypt.org/zanserver.sytes.net-crt.pem
SSL_KEY_PATH=C:/ProgramData/win-acme/acme-v02.api.letsencrypt.org/zanserver.sytes.net-key.pem
```

---

## ⚙️ CONFIGURAZIONE APACHE

### **File: `httpd.conf` - Aggiunte per GymTracker**
```apache
# ====================================
# GYMTRACKER CONFIGURATION
# ====================================

# Load required modules
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule headers_module modules/mod_headers.so
LoadModule expires_module modules/mod_expires.so

# GymTracker Virtual Directory
Alias /gymtracker "C:/filepubblici/gymtracker/public"

<Directory "C:/filepubblici/gymtracker/public">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
    DirectoryIndex index.html
    
    # CORS Headers for API integration
    Header always set Access-Control-Allow-Origin "https://zanserver.sytes.net"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header always set Access-Control-Allow-Credentials "true"
    
    # Security Headers
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    
    # Cache Configuration
    <FilesMatch "\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$">
        ExpiresActive On
        ExpiresDefault "access plus 7 days"
        Header append Cache-Control "public, immutable"
    </FilesMatch>
    
    <FilesMatch "\.(html|htm)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 hour"
        Header append Cache-Control "public, must-revalidate"
    </FilesMatch>
    
    # API Files - No Cache
    <FilesMatch "\.(json)$">
        ExpiresActive Off
        Header set Cache-Control "no-cache, no-store, must-revalidate"
        Header set Pragma "no-cache"
        Header set Expires "0"
    </FilesMatch>
</Directory>

# Reverse Proxy for Node.js API
ProxyPreserveHost On
ProxyTimeout 300

# GymTracker API Proxy
ProxyPass /gymtracker/api/ http://localhost:3007/api/
ProxyPassReverse /gymtracker/api/ http://localhost:3007/api/

# Handle WebSocket connections (if needed later)
ProxyPass /gymtracker/ws/ ws://localhost:3007/ws/
ProxyPassReverse /gymtracker/ws/ ws://localhost:3007/ws/

# Error handling for proxy
<Proxy "http://localhost:3007/*">
    ProxySet retry=300
    ProxySet timeout=5
</Proxy>
```

### **File: `C:/filepubblici/gymtracker/public/.htaccess`**
```apache
# GymTracker Frontend Routing
RewriteEngine On

# API Proxy (fallback if not configured in httpd.conf)
RewriteCond %{REQUEST_URI} ^/gymtracker/api/
RewriteRule ^api/(.*)$ http://localhost:3007/api/$1 [P,L]

# SPA Routing for frontend
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/gymtracker/api/

# Main routing
RewriteRule ^$ /gymtracker/public/utente/index.html [L]
RewriteRule ^utente/?$ /gymtracker/public/utente/index.html [L]
RewriteRule ^trainer/?$ /gymtracker/public/trainer/dashboard.html [L]

# Handle missing files
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.+)$ /gymtracker/public/utente/index.html [L]

# Security - Block sensitive files
<FilesMatch "\.(env|json|sql|log|bat)$">
    Require all denied
</FilesMatch>

# Compression
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

---

## 🗃️ DATABASE SQL MIGRATION

### **File: `database_migration.sql`**
```sql
-- ====================================
-- GYMTRACKER DATABASE MIGRATION
-- From Nicola to GymTracker Schema
-- ====================================

-- 1. BACKUP EXISTING DATA (run this first!)
-- CREATE TABLE backup_user_profiles AS SELECT * FROM user_profiles;
-- CREATE TABLE backup_schede AS SELECT * FROM schede;
-- CREATE TABLE backup_sessioni AS SELECT * FROM sessioni;
-- CREATE TABLE backup_exercises AS SELECT * FROM exercises;

-- 2. CREATE NEW WORKOUT_LOGS TABLE (main addition)
CREATE TABLE IF NOT EXISTS workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    sessione_id UUID REFERENCES sessioni(id) ON DELETE CASCADE,
    workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped')),
    exercises_data JSONB DEFAULT '{}',
    session_notes TEXT,
    trainer_notes TEXT,
    duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. ADD INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_sessione_id ON workout_logs(sessione_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_date ON workout_logs(workout_date);
CREATE INDEX IF NOT EXISTS idx_workout_logs_status ON workout_logs(status);

-- 4. ADD MISSING COLUMNS to exercises table (if not exists)
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS sets_count INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS reps_min INTEGER DEFAULT 8,
ADD COLUMN IF NOT EXISTS reps_max INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS weight_suggested DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS rest_seconds INTEGER DEFAULT 90,
ADD COLUMN IF NOT EXISTS is_modifiable_by_client BOOLEAN DEFAULT false;

-- 5. UPDATE existing exercises with default values
UPDATE exercises 
SET 
    sets_count = COALESCE(sets_count, 3),
    reps_min = COALESCE(reps_min, 8),
    reps_max = COALESCE(reps_max, 12),
    weight_suggested = COALESCE(weight_suggested, 0),
    rest_seconds = COALESCE(rest_seconds, 90),
    is_modifiable_by_client = COALESCE(is_modifiable_by_client, false)
WHERE sets_count IS NULL OR reps_min IS NULL OR reps_max IS NULL;

-- 6. ADD TRIGGER for updated_at on workout_logs
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workout_logs_updated_at 
    BEFORE UPDATE ON workout_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. RLS POLICIES for workout_logs
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own workout logs
CREATE POLICY "Users can view own workout logs" ON workout_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own workout logs
CREATE POLICY "Users can insert own workout logs" ON workout_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own workout logs
CREATE POLICY "Users can update own workout logs" ON workout_logs
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can see all workout logs
CREATE POLICY "Admins can view all workout logs" ON workout_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.user_type = 'admin'
        )
    );

-- Admins can update all workout logs (for trainer notes)
CREATE POLICY "Admins can update all workout logs" ON workout_logs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.user_type = 'admin'
        )
    );

-- 8. CREATE VIEWS for easier querying
CREATE OR REPLACE VIEW user_workout_stats AS
SELECT 
    user_id,
    COUNT(*) as total_sessions,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sessions,
    COUNT(CASE WHEN status = 'skipped' THEN 1 END) as skipped_sessions,
    ROUND(
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::decimal / 
        NULLIF(COUNT(*), 0) * 100, 2
    ) as adherence_percentage,
    AVG(CASE WHEN status = 'completed' THEN duration_minutes END) as avg_duration_minutes,
    MAX(workout_date) as last_workout_date
FROM workout_logs 
WHERE workout_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY user_id;

-- 9. SAMPLE DATA for testing (remove in production)
-- INSERT INTO workout_logs (user_id, sessione_id, workout_date, status, exercises_data) 
-- VALUES 
-- ('user-uuid-here', 'session-uuid-here', CURRENT_DATE, 'completed', 
--  '{"exercises": [{"name": "Squat", "sets": [{"reps": 10, "weight": 80}]}]}');

-- 10. VERIFY MIGRATION
SELECT 'Migration completed successfully!' as status;
SELECT table_name FROM information_schema.tables WHERE table_name = 'workout_logs';
```

### **File: `database_verification.sql`**
```sql
-- ====================================
-- VERIFY GYMTRACKER DATABASE SETUP
-- ====================================

-- Check all required tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('user_profiles', 'schede', 'sessioni', 'exercises', 'workout_logs') 
        THEN '✅ Required'
        ELSE '⚠️ Extra'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check workout_logs structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'workout_logs' 
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'workout_logs';

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'workout_logs';

-- Sample data counts
SELECT 
    (SELECT COUNT(*) FROM user_profiles) as users,
    (SELECT COUNT(*) FROM schede) as schede,
    (SELECT COUNT(*) FROM sessioni) as sessioni,
    (SELECT COUNT(*) FROM exercises) as exercises,
    (SELECT COUNT(*) FROM workout_logs) as workout_logs;

-- Check recent activity
SELECT status, COUNT(*) 
FROM workout_logs 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY status;
```

---

## 🚀 DEPLOYMENT CHECKLIST

### **Setup Steps:**

1. **📁 Create Directory Structure:**
   ```batch
   mkdir C:\filepubblici\gymtracker
   cd C:\filepubblici\gymtracker
   ```

2. **📥 Copy Files:**
   - Copy all `.bat` files to `C:\filepubblici\gymtracker\`
   - Create `.env` file with your configurations
   - Update Apache `httpd.conf`

3. **🗃️ Database Migration:**
   ```sql
   -- In Supabase SQL Editor:
   -- Run database_migration.sql
   -- Run database_verification.sql
   ```

4. **⚙️ Apache Configuration:**
   - Add GymTracker section to `httpd.conf`
   - Create `.htaccess` in public folder
   - Restart Apache: `net stop apache2.4 && net start apache2.4`

5. **🧪 Test:**
   ```batch
   # Test individual components
   start_apache.bat
   start_gymtracker.bat
   
   # Test full stack
   start_server.bat
   ```

6. **🌐 Verify URLs:**
   - `https://zanserver.sytes.net/gymtracker/` → Login page
   - `https://zanserver.sytes.net/gymtracker/api/health` → API health
   - `https://zanserver.sytes.net/gymtracker/utente/dashboard.html` → Client dashboard

### **Troubleshooting:**

- **Apache non parte**: Verifica sintassi con `httpd -t`
- **Node.js errori**: Controlla `.env` e porta 3007
- **Database errori**: Verifica connessione Supabase
- **API non raggiungibili**: Controlla reverse proxy configuration

Tutto è pronto per la migrazione da Nicola a GymTracker! 🎯