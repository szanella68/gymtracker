@echo off
setlocal enabledelayedexpansion

:: === Config GymTracker ===
set "REPO_DIR=C:\filepubblici\gymtracker"

cd /d "%REPO_DIR%" || (echo Repo non trovata: %REPO_DIR% & pause & exit /b 1)
for /f "delims=" %%x in ('git rev-parse --is-inside-work-tree 2^>nul') do set INSIDE=%%x
if not "%INSIDE%"=="true" (echo Non e' una repo Git. & pause & exit /b 1)

echo ===== 🏋️ GYMTRACKER GIT UPDATE (PULL) =====

:: Determina il branch corrente
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set "BRANCH=%%b"
if not defined BRANCH set "BRANCH=main"

:: Verifica remote branch esistente
git ls-remote --exit-code --heads origin %BRANCH% >nul 2>&1
if errorlevel 1 (
  echo Il branch remoto origin/%BRANCH% non esiste. Uso "main" se disponibile...
  git ls-remote --exit-code --heads origin main >nul 2>&1 && set "BRANCH=main"
)

echo Branch di riferimento: %BRANCH%

:: Rileva modifiche locali
set "HAS_LOCAL_CHANGES=0"
git diff --quiet || set "HAS_LOCAL_CHANGES=1"
git diff --cached --quiet || set "HAS_LOCAL_CHANGES=1"
git ls-files --others --exclude-standard >nul 2>&1 && for /f %%A in ('git ls-files --others --exclude-standard ^| find /c /v ""') do if not %%A==0 set "HAS_LOCAL_CHANGES=1"

if "%HAS_LOCAL_CHANGES%"=="1" (
  echo.
  echo ⚠️  Ci sono modifiche locali.
  echo   [1] Hard reset (perdi modifiche locali)
  echo   [2] Salva modifiche (stash) e aggiorna
  echo   [3] Annulla
  set /p CH="Scegli (1/2/3) [default 2]: "
  if not defined CH set "CH=2"

  if "%CH%"=="1" (
    echo.
    echo Eseguo HARD RESET a origin/%BRANCH% ...
    git fetch origin || (echo fetch fallito & pause & exit /b 1)
    git reset --hard origin/%BRANCH% || (echo reset fallito & pause & exit /b 1)
  ) else if "%CH%"=="2" (
    echo.
    echo Salvo modifiche in stash e aggiorno...
    git stash push -u -m "auto-stash prima di update" || (echo stash fallito & pause & exit /b 1)
    git fetch origin || (echo fetch fallito & pause & exit /b 1)
    git pull --rebase origin %BRANCH% || (echo pull --rebase fallito: risolvi conflitti e riprova & pause & exit /b 1)
    echo.
    echo Applico eventuale stash...
    git stash pop
    if errorlevel 1 (
      echo Nessuno stash da applicare o conflitti durante pop. Gestisci se necessario.
    )
  ) else (
    echo Operazione annullata.
    pause
    exit /b 0
  )
) else (
  echo.
  echo Nessuna modifica locale. Aggiorno...
  git fetch origin || (echo fetch fallito & pause & exit /b 1)
  git pull --rebase origin %BRANCH% || (echo pull --rebase fallito & pause & exit /b 1)
)

:: Submodules (se presenti)
git submodule update --init --recursive

echo.
echo ✅ Update completato. Stato breve:
git status -sb

echo.
pause
