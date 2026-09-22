@echo off
title Push Phonixe-Media to GitHub
cd /d "%~dp0"
echo ==============================================
echo Pushing Phonixe Media repository to GitHub...
echo ==============================================
echo.
"C:\Program Files\Git\cmd\git.exe" push -u origin main
echo.
echo ==============================================
echo If you saw a browser popup, complete sign-in!
echo ==============================================
pause
