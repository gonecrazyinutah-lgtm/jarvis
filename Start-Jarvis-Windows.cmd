@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is missing. Install the latest LTS from https://nodejs.org, then try again.
  pause
  exit /b 1
)
node scripts\launch.mjs
if errorlevel 1 pause
