@echo off
title Pizzeria al Paso - Servidor Backend Neon
cd /d "%~dp0"
echo =======================================================
echo    PIZZERIA AL PASO - SERVIDOR CONECTADO A NEON BD
echo =======================================================
echo.
echo 1. Verificando carpeta del proyecto: %CD%
echo 2. Iniciando servidor Node.js...
echo.
node servidor.js
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [ERROR] Ocurrio un problema al iniciar el servidor.
  pause
)

