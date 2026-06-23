@echo off
echo Starting Sakr Manning Agency Backend...
echo.

:: (Virtual environment activation skipped because packages are installed globally)

:: Run the Django development server
python manage.py runserver

:: Keep the window open if the server stops or crashes
pause
