@echo off
title Push Venus Green to GitHub
cd /d "%~dp0"
echo ========================================================
echo Pushing Venus Green to https://github.com/yesuraja20/VEENUS-GREEN
echo ========================================================
echo.
echo If a GitHub sign-in prompt appears, click "Sign in with your browser".
echo (You are already logged into GitHub in your browser!)
echo.
git push -u origin main --force
echo.
echo ========================================================
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS: Successfully pushed to https://github.com/yesuraja20/VEENUS-GREEN
) else (
    echo PUSH FAILED: Please check the message above.
)
echo ========================================================
echo.
pause
