#!/bin/sh
set -e

echo "🔄 Ejecutando migraciones de Prisma..."
npx prisma migrate deploy

echo "✅ Migraciones completadas"
echo "🚀 Iniciando aplicación..."
exec node dist/server.js
