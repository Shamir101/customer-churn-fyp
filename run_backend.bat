@echo off
echo ================================================
echo Starting the AIML Backend Server (Flask)
echo ================================================
echo.

cd /d "%~dp0"
cd backend

echo [1/2] Installing required Python packages...
pip install -r ..\requirements.txt

echo.
echo [2/2] Starting the AI Server...
python app.py

pause
