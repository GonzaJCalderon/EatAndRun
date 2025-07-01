@echo off
REM === Build + Zip para deploy a Hostinger ===

echo 🛠️ Ejecutando build de Vite...
call npm run build

IF %ERRORLEVEL% NEQ 0 (
  echo ❌ Error en el build. Abortando...
  exit /b 1
)

REM Eliminar ZIP anterior si existe
if exist frontend.zip (
  echo 🧹 Eliminando zip anterior...
  del /f /q frontend.zip
)

REM Comprimir contenido de dist en frontend.zip
echo 📦 Comprimiendo contenido de dist/ en frontend.zip...
powershell -Command "Compress-Archive -Path 'dist\*' -DestinationPath 'frontend.zip' -Force"

echo ✅ Build + ZIP completo. Archivo generado: frontend.zip
pause

