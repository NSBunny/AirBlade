@echo off
cd /d "%~dp0"

set "PYTHON_EXE=python"
if exist ".venv\Scripts\python.exe" (
    echo Found virtual environment. Using .venv python...
    set "PYTHON_EXE=.venv\Scripts\python.exe"
) else (
    echo Warning: .venv not found, trying system python...
)

echo Starting Fruit Ninja...
set PYTHONPATH=%~dp0
"%PYTHON_EXE%" -m src.main
if %ERRORLEVEL% NEQ 0 (
    echo Game exited with error code %ERRORLEVEL%
    pause
)
