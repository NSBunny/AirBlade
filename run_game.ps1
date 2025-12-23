# Powershell script to run the game correctly as a module
$ErrorActionPreference = "Stop"

# Ensure we are in the script's directory
Set-Location $PSScriptRoot
Write-Host "Working Directory: $PSScriptRoot"

# Initialize python path variable
$PythonExe = "python"

# Check if venv exists and use it directly
if (Test-Path ".venv\Scripts\python.exe") {
    Write-Host "Found virtual environment. Using .venv python..."
    $PythonExe = ".\.venv\Scripts\python.exe"
}
else {
    Write-Host "Warning: .venv not found. Attempting to run with system python..."
}

# Add current directory to PYTHONPATH to ensure src module is found
$env:PYTHONPATH = $PSScriptRoot

Write-Host "Starting Fruit Ninja..."
# Run explicitly using the determined python executable
& $PythonExe --version
$ver = & $PythonExe -c "import sys; print(sys.version_info.minor)"
if ($ver -gt 12) {
    Write-Host "WARNING: You are using Python 3.$ver. MediaPipe may not support this version." -ForegroundColor Red
    Write-Host "Please install Python 3.10 or 3.11 for best compatibility." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

& $PythonExe -m src.main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Game exited with an error. Press enter to close."
    Read-Host
}
