@echo off
echo Starting Sakr Manning Agency Application...
echo.

:: Start the backend API in a new window
start "Sakr Backend API" cmd /k "python manage.py runserver"

:: Start the frontend UI in a new window and open the browser automatically
cd Sakr-Manning-Agency-Frontend
start "Sakr Frontend UI" cmd /k "npm run dev -- --open"
