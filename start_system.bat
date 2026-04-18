@echo off
echo Starting Movie Booking System...

start cmd /k "cd backend && venv\Scripts\python manage.py runserver"
start cmd /k "cd frontend && npm run dev"

echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Login with: admin@happybooking.com / admin123
pause
