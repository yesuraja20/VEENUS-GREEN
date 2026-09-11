@echo off
title Push Venus Green to GitHub
cd /d "%~dp0"
set "PATH=C:\Users\acer\git\cmd;C:\Users\acer\git\mingw64\bin;%PATH%"

echo ========================================================
echo  VENUS GREEN - PUSH CODE TO GITHUB
echo  Target: https://github.com/yesuraja20/VEENUS-GREEN
echo ========================================================
echo.

:: 1. Check for uncommitted changes and commit them automatically
echo [1/3] Checking for any uncommitted changes...
git add -A
git diff-index --quiet HEAD || git commit -m "update: store address to Tirupur and website updates"

echo.
echo [2/3] Latest commits ready to push:
git log origin/main..main --oneline
echo.

:: 2. Push to GitHub
echo [3/3] Pushing to GitHub...
echo (If a GitHub sign-in window opens, click "Sign in with your browser")
echo.
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo  SUCCESS: Successfully pushed to GitHub!
    echo  View here: https://github.com/yesuraja20/VEENUS-GREEN
    echo ========================================================
    echo.
    pause
    exit /b 0
)

:: If push fails, offer GitHub Token option
echo.
echo ========================================================
echo  PUSH FAILED! Browser login may have timed out or failed.
echo ========================================================
echo.
echo You can push instantly using a GitHub Personal Access Token (PAT):
echo 1. Go to: https://github.com/settings/tokens
echo 2. Generate new token (classic) with "repo" checkbox selected.
echo.
set /p GHTOKEN="Paste your GitHub Token here (or press Enter to exit): "

if not "%GHTOKEN%"=="" (
    echo.
    echo Retrying push with provided token...
    git push https://%GHTOKEN%@github.com/yesuraja20/VEENUS-GREEN.git main --force
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ========================================================
        echo  SUCCESS: Pushed successfully with Token!
        echo ========================================================
        git remote set-url origin https://%GHTOKEN%@github.com/yesuraja20/VEENUS-GREEN.git
    ) else (
        echo.
        echo Push still failed. Please verify your token has 'repo' permissions.
    )
)

echo.
pause
