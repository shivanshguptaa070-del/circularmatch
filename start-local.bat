@echo off
setlocal
set "ROOT=%~dp0"

echo.
echo Starting CircularMatch in Demo Mode...
echo.
echo The first run may take a few minutes while packages are installed.
echo.

start "CircularMatch API" cmd /k "cd /d \"%ROOT%apps\api\" && py -m pip install -r requirements.txt && py -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
start "CircularMatch Website" cmd /k "cd /d \"%ROOT%apps\web\" && npm install && npm run dev"

echo Two windows were opened for the API and Website.
echo When the Website window says it is ready, open:
echo http://localhost:5173
echo.
pause
