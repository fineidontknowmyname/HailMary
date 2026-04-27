@echo off
echo.
echo  ==========================================
echo   Project Hail Mary ^| Dev Environment
echo  ==========================================
echo.
echo  Starting API server  (apps/api)  ...
echo  Starting Web server  (apps/web)  ...
echo.

start "Hail Mary — API" cmd /c "cd /d %~dp0apps\api && pnpm run dev & pause"
start "Hail Mary — WEB" cmd /k "cd /d %~dp0apps\web && pnpm run dev"
