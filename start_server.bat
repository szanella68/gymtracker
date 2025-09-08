@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ================================================
echo   🏋️ GYMTRACKER LAUNCH: Apache + Node.js
echo ================================================

rem --- avvia Apache in foreground (nuova finestra) ---
start "Apache-SSL" cmd /k "%cd%\start_apache.bat"

rem --- attesa breve ---
timeout /t 2 /nobreak >nul

rem --- avvia GymTracker Node.js (nuova finestra) ---
start "GymTracker PROD" cmd /k "%cd%\start_gymtracker.bat"

echo.
echo ✅ Finestre lanciate:
echo   - Apache-SSL (443)
echo   - GymTracker (3010)
echo.
echo Premi un tasto per aprire il browser...
pause >nul
start https://zanserver.sytes.net/gymtracker/
echo.
echo Puoi chiudere questa finestra. Le altre restano aperte.
pause >nul
endlocal
