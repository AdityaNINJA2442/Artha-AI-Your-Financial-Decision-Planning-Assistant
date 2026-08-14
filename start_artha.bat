@echo off
echo ===================================================
echo   ARTHA AI -- 1-Click Automated Startup Script
echo   Built by Hackjack
echo ===================================================
echo.

echo [1/3] Clearing stale background ports...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8001 ^| findstr LISTEN') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTEN') do taskkill /F /PID %%a >nul 2>&1

echo.
echo [2/3] Setting up Python Backend Environment...
cd /d "%~dp0backend"
python -m pip install -r requirements.txt
start "Artha AI Backend Server (Port 8001)" cmd /k "python -m uvicorn app.main:app --host 127.0.0.1 --port 8001"

echo.
echo [3/3] Setting up Node.js Frontend Environment...
cd /d "%~dp0frontend"
call npm install
start "Artha AI Frontend App (Port 5173)" cmd /k "npm run dev"

echo.
echo [4/4] Opening ARTHA AI in Browser...
timeout /t 3 >nul
start http://localhost:5173

echo.
echo ===================================================
echo   ARTHA AI is now running!
echo   Frontend: http://localhost:5173
echo   Backend API: http://127.0.0.1:8001/docs
echo ===================================================
pause
