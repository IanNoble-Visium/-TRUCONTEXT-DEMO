@echo off
echo TruContext Demo - PNG to SVG Icon Converter
echo ==========================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Check if required packages are installed
echo Checking dependencies...
python -c "import PIL" >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo Error installing dependencies
        pause
        exit /b 1
    )
)

REM Run the conversion script
echo.
echo Converting PNG icons to SVG...
python convert_png_to_svg.py ../public/icons ../public/icons-svg

echo.
echo Conversion complete! Check the public/icons-svg directory.
pause 