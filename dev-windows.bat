@echo off
REM Navegar al directorio 'app'
cd /d "%~dp0app"

echo ===========================================
echo   Learn English Interactive - Modo Dev    
echo ===========================================

REM Verificar si node_modules existe, si no, instalar dependencias
if not exist "node_modules\" (
    echo Instalando dependencias...
    call npm install
)

REM Iniciar el navegador en segundo plano
echo Abriendo navegador en http://localhost:3000
start http://localhost:3000

REM Ejecutar el comando de desarrollo
echo Iniciando servidor de desarrollo...
call npm run dev

pause
