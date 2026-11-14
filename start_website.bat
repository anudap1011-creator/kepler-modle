@echo off
title NASA Kepler Space Telescope - 3D Explorer
cd /d "%~dp0"
echo ========================================================
echo   Starting NASA Kepler 3D Spacecraft Experience Server
echo   URL: http://localhost:8080/
echo ========================================================
echo.
timeout /t 2 /nobreak >nul
start http://localhost:8080/
python server.py
if errorlevel 1 (
    echo.
    echo Python was not found or encountered an error.
    echo Trying with 'py' command...
    py server.py
)
pause
