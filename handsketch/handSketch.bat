@echo off
title handSketch Launcher
cd /d "%~dp0"

echo [Launcher] Verifying Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [Error] Python is not installed or not added to your system PATH.
    echo Please install Python and try again.
    pause
    exit /b
)

echo [Launcher] Checking dependencies...
python -c "import cv2, mediapipe, numpy" >nul 2>&1
if %errorlevel% neq 0 (
    echo [Launcher] Missing dependencies detected. Installing required packages...
    python -m pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo [Error] Failed to install dependencies. Please run in terminal to inspect logs.
        pause
        exit /b
    )
)

echo [Launcher] Starting handSketch...
:: Using 'pythonw.exe' launches the script as a GUI app without opening a console window.
start "" pythonw main.py
exit
