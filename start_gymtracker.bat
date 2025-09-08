@echo on
setlocal EnableExtensions

rem === PERCORSO GYMTRACKER ===
set "GYMTRACKER_DIR=C:\filepubblici\gymtracker"
set "GYMTRACKER_PORT=3010"

cd /d "%GYMTRACKER_DIR%"

where node >nul 2>&1
if errorlevel 1 (
  echo [ERRORE] Node.js non nel PATH.
  goto HOLD
)

rem assicurati che npm sia disponibile
where npm >nul 2>&1
if errorlevel 1 (
  echo [ERRORE] npm non nel PATH.
  goto HOLD
)

rem installa dipendenze se mancano
if not exist "node_modules" (
  echo [NPM] Installazione dipendenze iniziale...
  call npm install
) else (
  echo [NPM] Verifica pacchetti chiave...
  call npm ls @supabase/supabase-js >nul 2>&1
  if errorlevel 1 (
    echo [NPM] Installo dipendenze mancanti (@supabase/supabase-js, pg)
    call npm install @supabase/supabase-js pg
  )
)

rem evita doppio avvio: se 3010 gia' in LISTENING non rilancia
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
