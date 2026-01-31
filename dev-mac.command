#!/bin/bash
# Navegar al directorio donde se encuentra el script
cd "$(dirname "$0")/app"

echo "==========================================="
echo "  Learn English Interactive - Modo Dev     "
echo "==========================================="

# Verificar si node_modules existe, si no, instalar dependencias
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
fi

# Ejecutar el comando de desarrollo en segundo plano
echo "Iniciando servidor de desarrollo..."
npm run dev &

# Esperar a que el servidor arranque un poco
sleep 3

# Abrir el navegador
echo "Abriendo navegador en http://localhost:3000"
open http://localhost:3000

# Mantener la terminal abierta para ver los logs
wait
