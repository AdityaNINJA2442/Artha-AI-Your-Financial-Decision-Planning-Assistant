@echo off
echo ===================================================
echo   ARTHA AI -- 1-Click Automated Startup Script
echo   Built by Aditya Prakash
echo ===================================================
echo.

echo [1/3] Setting up Python Backend Environment...
cd /d "%~dp0backend"
python -m pip install -r requirements.txt
start "Artha AI Backend Server (Port 8000)" cmd /k "python -m uvicorn app.main:app --reload --port 8000"

echo.
echo [2/3] Setting up Node.js Frontend Environment...
cd /d "%~dp0frontend"
call npm install
start "Artha AI Frontend App (Port 5173)" cmd /k "npm run dev"

echo.
echo [3/3] Opening ARTHA AI in Browser...
timeout /t 3 >nul
start http://localhost:5173

echo.
echo ===================================================
echo   ARTHA AI is now running!
echo   Frontend: http://localhost:5173
echo   Backend API: http://127.0.0.1:8000/docs
echo ===================================================
pause
