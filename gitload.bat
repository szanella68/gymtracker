@echo off
setlocal enabledelayedexpansion

:: ==============================================
::  gitload.bat - Sync helper for this repository
::  Usage: gitload.bat [percorso_repo]
::  - Se non passi nulla, usa la cartella dello script
::  - Crea .gitkeep nelle cartelle vuote (escluse .git e node_modules)
::  - Esegue add/commit (se necessario) e pull --rebase + push
:: ==============================================

:: 1) Verifica Git installato
git --version >nul 2>&1 || (
  echo Git non e' installato o non nel PATH.
  pause & exit /b 1
)

:: 2) Determina il percorso della repo e l'eventuale remote
set "_ARG=%~1"
set "_REMOTE_ARG=%~2"
if not defined _ARG (
  if not defined REPO_DIR (
    set "REPO_DIR=%~dp0"
  )
) else (
  set "REPO_DIR=%_ARG%"
)

:: fallback: se vuoto per qualche motivo, usa cartella corrente
if not defined REPO_DIR set "REPO_DIR=%cd%"

cd /d "%REPO_DIR%" || (echo Repo non trovata: %REPO_DIR% & pause & exit /b 1)

for /f "delims=" %%x in ('git rev-parse --is-inside-work-tree 2^>nul') do set INSIDE=%%x
if /i not "%INSIDE%"=="true" (
  echo La cartella non risulta repository Git. Inizializzo...
  git init || (echo git init fallito. & pause & exit /b 1)
  rem Imposta main come branch predefinito
  git checkout -B main >nul 2>&1

  rem Configura remote origin se assente
  set "_REMOTE_URL=%_REMOTE_ARG%"
  if not defined _REMOTE_URL set "_REMOTE_URL=%GIT_REMOTE_URL%"
  if not defined _REMOTE_URL set "_REMOTE_URL=https://github.com/szanella68/gymtracker.git"

  git remote get-url origin >nul 2>&1
  if errorlevel 1 (
    echo Imposto origin a: %_REMOTE_URL%
    git remote add origin "%_REMOTE_URL%" || (echo Configurazione remote fallita. & pause & exit /b 1)
  ) else (
    for /f "delims=" %%r in ('git remote get-url origin') do set CURR_ORIGIN=%%r
    echo Remote origin gia' impostato: %CURR_ORIGIN%
  )
)

echo ===== GIT SYNC: %REPO_DIR% =====

:: 3) Crea .gitkeep nelle directory vuote (escluse .git e node_modules)
for /f "delims=" %%D in ('dir /ad /b /s') do (
  set "name=%%~nxD"
  if /i not "!name!"==".git" if /i not "!name!"=="node_modules" (
    dir "%%D\*" /a-d /b >nul 2>&1 || (echo.>"%%D\.gitkeep")
  )
)

:: 4) Aggiungi tutto e committa se necessario
echo Aggiungo tutte le modifiche...
git add -A

set "HAVECHANGES="
git diff --cached --quiet || set "HAVECHANGES=1"

if defined HAVECHANGES (
  set "commit_msg="
  set /p commit_msg="Messaggio commit (default: sync): "
  if not defined commit_msg set "commit_msg=sync"
  git commit -m "!commit_msg!" || (echo Commit fallito. & pause & exit /b 1)
) else (
  echo Nessuna modifica da commitare.
)

:: 5) Determina branch corrente
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set "BRANCH=%%b"
if not defined BRANCH set "BRANCH=main"

:: 6) Sincronizza con remoto (crea upstream se mancante)
git remote get-url origin >nul 2>&1
if errorlevel 1 (
  echo Nessun remote 'origin' configurato. Puoi passarlo come 2^o argomento:
  echo   gitload.bat ^<percorso_repo^> ^<REMOTE_URL^>
  echo Oppure imposta GIT_REMOTE_URL variabile di ambiente.
  pause & exit /b 1
)
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
