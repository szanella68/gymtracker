@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ================================================
echo   🏋️ GYMTRACKER LAUNCH: Apache + Node.js
echo ================================================

rem --- avvia Apache in foreground ---
start "Apache-SSL" cmd /k "%cd%\start_apache.bat"

rem --- aspetta un momento per Apache ---
timeout /t 3 /nobreak

rem --- avvia GymTracker Node.js ---
start "GymTracker PROD" cmd /k "%cd%\start_gymtracker.bat"

echo.
echo ✅ Finestre lanciate:
echo   - Apache-SSL (porta 443)
echo   - GymTracker (porta 3007)
echo.
echo 🌐 Accesso: https://zanserver.sytes.net/gymtracker/
echo.
echo Premi un tasto per aprire il browser...
pause
start https://zanserver.sytes.net/gymtracker/
endlocal
