@echo off
echo ================================================
echo Starting Customer Churn Full Stack Application
echo ================================================
echo.
echo Launching the Backend in a new window...
start cmd /k "call run_backend.bat"

echo Launching the Frontend in a new window...
start cmd /k "call run_frontend.bat"

echo.
echo Both services have been started in separate windows!
echo If you close those windows, the services will stop.
echo.
pause
