# 🌐 Implementazione GymTracker su Apache Locale
## Setup per Windows + Apache + Reverse Proxy Esistente

> **Ambiente Target**: Windows + Apache esistente + SSL  
> **URL Base**: `https://zanserver.sytes.net/gymtracker/`  
> **Directory**: `C:/FilePubblici/gymtracker/`  
> **Backend**: Node.js porta 3007  

---

## 📁 STRUTTURA DIRECTORY APACHE

### **Posizionamento File (Directory Pubblica):**
```
📁 C:/FilePubblici/gymtracker/
├── 👤 utente/                    # Interfaccia clienti (DEFAULT)
│   ├── index.html               # Entry point + auth PRINCIPALE
│   ├── dashboard.html           # Dashboard cliente  
│   ├── calendario.html          # Calendario con popup
│   ├── profilo.html             # Profilo completo esistente
│   ├── report.html              # Report progressi
│   └── css/
│       ├── utente.css          # Stili cliente (motivazionali)
│       └── popup-sessioni.css  # Stili popup calendario
│
├── 🧑‍🏫 trainer/                  # Interfaccia trainer (SOLO ADMIN)
│   ├── dashboard.html           # Dashboard trainer
│   ├── clienti.html             # Gestione clienti
│   ├── schede.html              # Creazione schede rigide
│   ├── calendario.html          # Pianificazione clienti
│   ├── report.html              # Report avanzati
│   └── css/
│       ├── trainer.css          # Stili trainer (professionali)
│       └── gestione-clienti.css # Stili gestione
│
├── 🔧 shared/                    # Componenti condivisi
│   ├── components/              # Header/footer esistenti
│   ├── js/
│   │   ├── core/               # API e utils esistenti
│   │   ├── calendario-popup.js  # Logica popup sessioni
│   │   └── workout-logging.js   # Sistema logging
│   └── css/
│       ├── shared.css          # Stili base esistenti
│       └── dual-interface.css  # Stili comuni 2 interfacce
│
└── 📄 index.html                # REDIRECT alla pagina login principale
```

---

## ⚙️ CONFIGURAZIONE APACHE 

### **Configurazione Virtual Host per GymTracker**
```apache
# File: httpd.conf o sites-enabled/gymtracker.conf
# Aggiungi questa configurazione al tuo Apache esistente

# Alias per servire GymTracker da directory personalizzata
Alias /gymtracker "C:/FilePubblici/gymtracker"

<Directory "C:/FilePubblici/gymtracker">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
    
    # Headers per CORS (supporta Node.js backend)
    Header always set Access-Control-Allow-Origin "https://zanserver.sytes.net"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
    
    # Cache ottimizzato per app dinamica
    <filesMatch "\.(css|js|png|jpg|jpeg|gif|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 7 days"
    </filesMatch>
    
    <filesMatch "\.(html)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 hour"
    </filesMatch>
</Directory>

# Reverse proxy per API Node.js (porta 3007)
ProxyPreserveHost On
ProxyPass /gymtracker/api/ http://localhost:3007/api/
ProxyPassReverse /gymtracker/api/ http://localhost:3007/api/
```

### **File: `C:/FilePubblici/gymtracker/.htaccess`**
```apache
# Reverse proxy per API Node.js (se non configurato in httpd.conf)
RewriteEngine On

# API calls → Node.js porta 3007
RewriteRule ^api/(.*)$ http://localhost:3007/api/$1 [P,L]

# Routing per interfacce separate
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Redirect root a login principale
RewriteRule ^$ /gymtracker/utente/index.html [L]

# Interfaccia utente (DEFAULT per tutti)
RewriteRule ^utente$ /gymtracker/utente/index.html [L]
RewriteRule ^utente/$ /gymtracker/utente/index.html [L]

# Interfaccia trainer (SOLO per admin - check via JS)
RewriteRule ^trainer$ /gymtracker/trainer/dashboard.html [L]
RewriteRule ^trainer/$ /gymtracker/trainer/dashboard.html [L]
```

---

## 🔗 ROUTING E AUTENTICAZIONE

### **Landing Page: `index.html` (Simple Redirect)**
```html
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GymTracker</title>
    <script>
        // Redirect immediato al sistema principale
        window.location.href = '/gymtracker/utente/';
    </script>
</head>
<body>
    <p>Reindirizzamento in corso...</p>
</body>
</html>
```

---

## 📱 INTERFACCIA CLIENTE

### **File: `utente/index.html` (Login/Register Principale)**
```html
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GymTracker - Accesso</title>
    <base href="/gymtracker/">
    <link rel="stylesheet" href="shared/css/shared.css">
    <link rel="stylesheet" href="utente/css/utente.css">
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <h1>🏋️ GymTracker</h1>
                <p>Il tuo personal trainer digitale</p>
            </div>
            
            <!-- Login Form -->
            <form id="loginForm" class="auth-form active">
                <h2>Accedi</h2>
                <div class="form-group">
                    <label for="loginEmail">Email</label>
                    <input type="email" id="loginEmail" name="email" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword">Password</label>
                    <input type="password" id="loginPassword" name="password" required>
                </div>
                <button type="submit" class="btn-primary">Accedi</button>
                <div class="auth-error" id="loginError"></div>
                
                <div class="auth-switch">
                    <p>Non hai un account? 
                        <a href="#" onclick="showRegisterForm()">Registrati qui</a>
                    </p>
                </div>
            </form>
            
            <!-- Register Form -->
            <form id="registerForm" class="auth-form">
                <h2>Registrati come Cliente</h2>
                <div class="form-group">
                    <label for="registerName">Nome completo</label>
                    <input type="text" id="registerName" name="name" required>
                </div>
                <div class="form-group">
                    <label for="registerEmail">Email</label>
                    <input type="email" id="registerEmail" name="email" required>
                </div>
                <div class="form-group">
                    <label for="registerPassword">Password</label>
                    <input type="password" id="registerPassword" name="password" required minlength="6">
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Conferma Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" required>
                </div>
                <button type="submit" class="btn-primary">Registrati</button>
                <div class="auth-error" id="registerError"></div>
                
                <div class="auth-switch">
                    <p>Hai già un account? 
                        <a href="#" onclick="showLoginForm()">Accedi qui</a>
                    </p>
                </div>
            </form>
        </div>
    </div>

    <script src="shared/js/core/api.js"></script>
    <script>
        // Check se già autenticato
        if (localStorage.getItem('gymtracker_token')) {
            redirectBasedOnRole();
        }
        
        // Switch between login/register forms
        function showLoginForm() {
            document.getElementById('loginForm').classList.add('active');
            document.getElementById('registerForm').classList.remove('active');
        }
        
        function showRegisterForm() {
            document.getElementById('registerForm').classList.add('active');
            document.getElementById('loginForm').classList.remove('active');
        }
        
        // Login handler
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const email = formData.get('email');
            const password = formData.get('password');
            
            try {
                const response = await fetch('/gymtracker/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('gymtracker_token', data.session.access_token);
                    localStorage.setItem('gymtracker_user', JSON.stringify(data.user));
                    await redirectBasedOnRole();
                } else {
                    document.getElementById('loginError').textContent = data.error;
                }
            } catch (error) {
                document.getElementById('loginError').textContent = 'Errore di connessione';
            }
        });
        
        // Register handler
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const name = formData.get('name');
            const email = formData.get('email');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            
            // Validate passwords match
            if (password !== confirmPassword) {
                document.getElementById('registerError').textContent = 'Le password non coincidono';
                return;
            }
            
            try {
                const response = await fetch('/gymtracker/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email, 
                        password, 
                        full_name: name,
                        user_type: 'standard' // Tutti i nuovi utenti sono clienti
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('gymtracker_token', data.session.access_token);
                    localStorage.setItem('gymtracker_user', JSON.stringify(data.user));
                    // Nuovi utenti vanno sempre all'interfaccia cliente
                    window.location.href = '/gymtracker/utente/dashboard.html';
                } else {
                    document.getElementById('registerError').textContent = data.error;
                }
            } catch (error) {
                document.getElementById('registerError').textContent = 'Errore di connessione';
            }
        });
        
        // Redirect based on user role in database
        async function redirectBasedOnRole() {
            try {
                const response = await fetch('/gymtracker/api/users/me', {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('gymtracker_token')
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const userType = data.profile?.user_type || 'standard';
                    
                    if (userType === 'admin') {
                        // Admin → Interfaccia Trainer
                        window.location.href = '/gymtracker/trainer/dashboard.html';
                    } else {
                        // Standard/tutti gli altri → Interfaccia Cliente
                        window.location.href = '/gymtracker/utente/dashboard.html';
                    }
                } else {
                    // Token non valido, resta sulla login
                    localStorage.removeItem('gymtracker_token');
                    localStorage.removeItem('gymtracker_user');
                }
            } catch (error) {
                console.error('Error checking user role:', error);
                // In caso di errore, vai all'interfaccia cliente per default
                window.location.href = '/gymtracker/utente/dashboard.html';
            }
        }
    </script>
</body>
</html>
```

### **File: `utente/dashboard.html` (Dashboard Cliente)**
```html
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GymTracker - Il mio Dashboard</title>
    <base href="/gymtracker/">
    <link rel="stylesheet" href="shared/css/shared.css">
    <link rel="stylesheet" href="utente/css/utente.css">
</head>
<body>
    <div id="headerContainer"></div>
    
    <main class="user-dashboard">
        <div class="dashboard-header">
            <h1>🏋️ I miei Allenamenti</h1>
            <div class="user-welcome">
                <span id="userWelcome">Benvenuto!</span>
                <button onclick="logout()" class="btn-logout">Esci</button>
            </div>
        </div>
        
        <!-- Quick Stats -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">🏃</div>
                <div class="stat-info">
                    <h3 id="adherenceRate">--</h3>
                    <p>Aderenza questo mese</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">💪</div>
                <div class="stat-info">
                    <h3 id="completedWorkouts">--</h3>
                    <p>Sessioni completate</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📈</div>
                <div class="stat-info">
                    <h3 id="progressTrend">--</h3>
                    <p>Tendenza progressi</p>
                </div>
            </div>
        </div>
        
        <!-- Navigation Menu -->
        <div class="nav-menu">
            <a href="utente/calendario.html" class="nav-card primary">
                <div class="nav-icon">📅</div>
                <h3>Il mio Calendario</h3>
                <p>Allenamenti programmati e da completare</p>
            </a>
            
            <a href="utente/profilo.html" class="nav-card">
                <div class="nav-icon">👤</div>
                <h3>Il mio Profilo</h3>
                <p>Informazioni personali e obiettivi</p>
            </a>
            
            <a href="utente/report.html" class="nav-card">
                <div class="nav-icon">📊</div>
                <h3>I miei Progressi</h3>
                <p>Statistiche e analisi performance</p>
            </a>
        </div>
        
        <!-- Prossime Sessioni -->
        <div class="upcoming-sessions">
            <h2>🎯 Prossimi Allenamenti</h2>
            <div id="upcomingSessions">
                <!-- Popolato dinamicamente -->
            </div>
        </div>
    </main>

    <script src="shared/js/core/api.js"></script>
    <script src="shared/js/core/utils.js"></script>
    <script>
        // Auth check
        if (!localStorage.getItem('gymtracker_token')) {
            window.location.href = '/gymtracker/utente/';
        }
        
        // Load user dashboard data
        async function loadDashboard() {
            try {
                const userProfile = await GymAPI.get('/users/me');
                document.getElementById('userWelcome').textContent = 
                    `Ciao, ${userProfile.profile.full_name || 'Atleta'}!`;
                
                // Load stats (implementa API specifiche)
                loadStats();
                loadUpcomingSessions();
                
            } catch (error) {
                console.error('Error loading dashboard:', error);
                if (error.status === 401) {
                    localStorage.removeItem('gymtracker_token');
                    window.location.href = '/gymtracker/utente/';
                }
            }
        }
        
        async function loadStats() {
            // Implementa chiamate API per statistiche
            // TODO: GET /api/users/stats
        }
        
        async function loadUpcomingSessions() {
            // TODO: GET /api/calendar/upcoming
        }
        
        function logout() {
            localStorage.removeItem('gymtracker_token');
            localStorage.removeItem('gymtracker_user');
            window.location.href = '/gymtracker/';
        }
        
        // Initialize
        loadDashboard();
    </script>
</body>
</html>
```

---

## 🧑‍🏫 INTERFACCIA TRAINER

### **File: `trainer/dashboard.html` (Dashboard Trainer)**
```html
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GymTracker - Dashboard Trainer</title>
    <base href="/gymtracker/">
    <link rel="stylesheet" href="shared/css/shared.css">
    <link rel="stylesheet" href="trainer/css/trainer.css">
</head>
<body>
    <div id="headerContainer"></div>
    
    <main class="trainer-dashboard">
        <div class="dashboard-header">
            <h1>🧑‍🏫 Dashboard Trainer</h1>
            <div class="trainer-actions">
                <button onclick="showNewClientModal()" class="btn-primary">+ Nuovo Cliente</button>
                <button onclick="logout()" class="btn-logout">Esci</button>
            </div>
        </div>
        
        <!-- Trainer Stats -->
        <div class="trainer-stats">
            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-info">
                    <h3 id="totalClients">--</h3>
                    <p>Clienti attivi</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📋</div>
                <div class="stat-info">
                    <h3 id="activePrograms">--</h3>
                    <p>Programmi attivi</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📈</div>
                <div class="stat-info">
                    <h3 id="avgAdherence">--</h3>
                    <p>Aderenza media</p>
                </div>
            </div>
        </div>
        
        <!-- Navigation -->
        <div class="trainer-nav">
            <a href="trainer/clienti.html" class="nav-card primary">
                <div class="nav-icon">👥</div>
                <h3>Gestione Clienti</h3>
                <p>Visualizza e gestisci i tuoi clienti</p>
            </a>
            
            <a href="trainer/schede.html" class="nav-card">
                <div class="nav-icon">📋</div>
                <h3>Creazione Schede</h3>
                <p>Crea e modifica programmi di allenamento</p>
            </a>
            
            <a href="trainer/calendario.html" class="nav-card">
                <div class="nav-icon">📅</div>
                <h3>Pianificazione</h3>
                <p>Assegna e programma allenamenti</p>
            </a>
            
            <a href="trainer/report.html" class="nav-card">
                <div class="nav-icon">📊</div>
                <h3>Report & Analytics</h3>
                <p>Analisi performance e progressi</p>
            </a>
        </div>
        
        <!-- Clients needing attention -->
        <div class="attention-needed">
            <h2>⚠️ Clienti che richiedono attenzione</h2>
            <div id="attentionClients">
                <!-- Popolato dinamicamente -->
            </div>
        </div>
    </main>

    <script src="shared/js/core/api.js"></script>
    <script>
        // Auth + role check semplificato
        async function checkTrainerAccess() {
            const token = localStorage.getItem('gymtracker_token');
            if (!token) {
                window.location.href = '/gymtracker/utente/';
                return;
            }
            
            try {
                const userProfile = await GymAPI.get('/users/me');
                if (userProfile.profile.user_type !== 'admin') {
                    alert('Accesso riservato agli amministratori');
                    window.location.href = '/gymtracker/utente/dashboard.html';
                    return;
                }
                
                loadTrainerDashboard();
            } catch (error) {
                localStorage.removeItem('gymtracker_token');
                window.location.href = '/gymtracker/utente/';
            }
        }
        
        async function loadTrainerDashboard() {
            // TODO: Load trainer stats and data
            // GET /api/trainer/stats
            // GET /api/clients?status=active
        }
        
        function logout() {
            localStorage.removeItem('gymtracker_token');
            window.location.href = '/gymtracker/';
        }
        
        // Initialize
        checkTrainerAccess();
    </script>
</body>
</html>
```

---

## 🛠️ MODIFICHE BACKEND

### **Aggiornamento server.js per nuovo path:**
```javascript
// Modifica in server.js - base path aggiornato
app.use('/gymtracker', express.static(path.join(__dirname, 'public')));

// Servire file statici anche sotto /gymtracker/ per compatibilità
app.use('/gymtracker', express.static(path.join(__dirname, 'public')));

// Aggiorna anche i CORS origins se necessario
app.use(cors({
  origin: [
    'http://localhost:3007',
    'https://zanserver.sytes.net',
    process.env.FRONTEND_URL || 'https://zanserver.sytes.net'
  ],
  credentials: true,
}));
```

### **Database - Nessuna modifica necessaria:**
```sql
-- Il database resta identico, solo l'app cambia path
-- Nessuna migrazione necessaria
```

---

## 🚀 SCRIPT DI AVVIO AGGIORNATO

### **File: `start_server.bat` (aggiornato)**
```batch
@echo off
echo ========================================
echo   GymTracker Dual Interface Setup
echo ========================================

echo Avvio Apache...
net start apache2.4
timeout /t 3 /nobreak

echo Avvio Node.js Backend (porta 3007)...
cd /d %~dp0
start cmd /k "npm run dev"

echo Attendo Node.js...
timeout /t 3 /nobreak

echo ========================================
echo   Setup completato!
echo ========================================
echo.
echo Interfacce disponibili:
echo - Login principale: https://zanserver.sytes.net/gymtracker/
echo - Dashboard Cliente: https://zanserver.sytes.net/gymtracker/utente/dashboard.html
echo - Dashboard Trainer: https://zanserver.sytes.net/gymtracker/trainer/dashboard.html
echo - API Health: https://zanserver.sytes.net/gymtracker/api/health
echo.
echo Nota: Admin definiti manualmente nel database (user_type='admin')
echo Tutti i nuovi registrati sono automaticamente clienti
echo.
echo Premi un tasto per aprire il browser...
pause

start https://zanserver.sytes.net/gymtracker/
```

---

## ✅ CHECKLIST IMPLEMENTAZIONE

### **Fase 1: Setup Base (Mezza giornata)**
- [ ] Creare struttura directory `utente/` e `trainer/`
- [ ] Configurare `.htaccess` per routing automatico
- [ ] Implementare sistema login/register unificato
- [ ] Test redirect automatico per ruoli

### **Fase 2: Interfaccia Cliente (2 giorni)**
- [ ] Dashboard cliente (`utente/dashboard.html`)
- [ ] Calendario con popup sessioni (`utente/calendario.html`)
- [ ] Sistema logging esercizi (popup)
- [ ] Profilo e report progressi

### **Fase 3: Interfaccia Trainer (2 giorni)**
- [ ] Dashboard trainer (`trainer/dashboard.html`)
- [ ] Gestione clienti (`trainer/clienti.html`)
- [ ] Creazione schede rigide (`trainer/schede.html`)
- [ ] Pianificazione calendario clienti

### **Fase 4: Backend API (1 giorno)**
- [ ] Nuova tabella `workout_logs`
- [ ] API calendario: `GET /api/calendar/:date/session`
- [ ] API logging: `POST /api/sessions/:id/start|log-exercise|complete`
- [ ] Test integrazione completa

**Totale: 5.5 giorni di implementazione**

---

## 🔧 COMANDI SETUP RAPIDO

### **Creazione Directory:**
```batch
mkdir C:\FilePubblici\gymtracker
mkdir C:\FilePubblici\gymtracker\utente
mkdir C:\FilePubblici\gymtracker\trainer
mkdir C:\FilePubblici\gymtracker\shared
mkdir C:\FilePubblici\gymtracker\shared\js
mkdir C:\FilePubblici\gymtracker\shared\css
mkdir C:\FilePubblici\gymtracker\utente\css
mkdir C:\FilePubblici\gymtracker\trainer\css
```

### **Test Apache Config:**
```apache
# Test che alias funzioni
curl https://zanserver.sytes.net/gymtracker/index.html

# Test reverse proxy API
curl https://zanserver.sytes.net/gymtracker/api/health
```

---

## 📊 URL MAPPING

| Funzione | URL | File |
|----------|-----|------|
| **Login** | `/gymtracker/` | `index.html` → `utente/index.html` |
| **Dashboard Cliente** | `/gymtracker/utente/dashboard.html` | `utente/dashboard.html` |
| **Dashboard Trainer** | `/gymtracker/trainer/dashboard.html` | `trainer/dashboard.html` |
| **API Backend** | `/gymtracker/api/*` | Proxy → `localhost:3007/api/*` |
| **Assets** | `/gymtracker/shared/*` | `shared/css/`, `shared/js/` |

La guida è completa e pronta per l'implementazione nel tuo ambiente Apache! 🚀