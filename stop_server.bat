@echo off
cd /d "%~dp0"
echo 🛑 Arresto GymTracker...
start "STOP GYMTRACKER" cmd /k "%~dp0stop_core.bat"
