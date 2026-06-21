@echo off
echo ==============================================
echo   Deploying Carbon Footprint App to Surge
echo ==============================================
echo.
cd /d "%~dp0"
echo 1. Building latest assets...
call npm run build
echo.
echo 2. Deploying to Surge...
echo (If this is your first time, enter an email and password to create a free account)
echo.
call npx surge ./dist
echo.
echo ==============================================
echo   Deployment completed!
echo ==============================================
pause
