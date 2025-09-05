@echo off
echo ========================================
echo   GymTracker Dual Interface Setup
echo ========================================

echo Verificando installazione Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRORE: Node.js non trovato. Installa Node.js prima di continuare.
    echo Scarica da: https://nodejs.org/
    pause
    exit /b 1
)

echo Installando dipendenze Node.js...
npm install
if %errorlevel% neq 0 (
    echo ERRORE: Fallita installazione dipendenze NPM
    pause
    exit /b 1
)

echo.
echo Avviando servizi...
echo.

echo Tentativo avvio Apache...
net start apache2.4 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Apache avviato con successo
) else (
    echo ⚠ Impossibile avviare Apache automaticamente
    echo   Assicurati che Apache sia installato e configurato correttamente
)
timeout /t 2 /nobreak >nul

echo.
echo Avviando Node.js Backend (porta 3007)...
cd /d "%~dp0"
start "GymTracker Backend" cmd /k "npm run dev"

echo Attendo avvio Node.js...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   Setup completato!
echo ========================================
echo.
echo Interfacce disponibili:
echo - Login principale: https://zanserver.sytes.net/gymtracker/
echo - Dashboard Cliente: https://zanserver.sytes.net/gymtracker/utente/dashboard.html
echo - Dashboard Trainer: https://zanserver.sytes.net/gymtracker/trainer/dashboard.html
echo - API Health: http://localhost:3007/api/health
echo.
echo Credenziali di default:
echo - Admin: admin@gymtracker.local / admin123
echo - Oppure registrati come nuovo cliente
echo.
echo Note:
echo - Admin definiti manualmente nel database (user_type='admin')
echo - Tutti i nuovi registrati sono automaticamente clienti
echo - Il backend Node.js deve rimanere in esecuzione
echo.
echo Premi un tasto per aprire il browser...
pause >nul

start https://zanserver.sytes.net/gymtracker/

echo.
echo Per fermare il sistema:
echo - Chiudi la finestra del backend Node.js
echo - Opzionalmente: net stop apache2.4
echo.
echo Premi un tasto per chiudere...
pause >nul