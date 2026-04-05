@echo off
echo ================================================
echo Starting the Web Dashboard (React Frontend)
echo ================================================
echo.

cd /d "%~dp0"
cd frontend

echo [1/2] Installing website dependencies (might take a minute)...
call npm install

echo.
echo [2/2] Starting the visual dashboard...
call npm run dev

pause
