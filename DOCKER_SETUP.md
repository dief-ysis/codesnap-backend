# 🐳 Docker Setup - CodeSnap Backend

Configuración Docker optimizada para el backend de CodeSnap con Node.js, TypeScript y Prisma.

## 📦 Archivos Creados

- **Dockerfile** - Multi-stage build optimizado para producción
- **Dockerfile.dev** - Imagen para desarrollo con hot-reload
- **docker-compose.yml** - Orquestación para producción
- **docker-compose.dev.yml** - Orquestación para desarrollo
- **.dockerignore** - Excluye archivos innecesarios del build
- **entrypoint.sh** - Runs Prisma migrations before starting the app
- **Makefile** - Comandos útiles para gestionar Docker

## 🚀 Uso Rápido

### Modo Desarrollo (con hot-reload)
```powershell
docker-compose -f docker-compose.dev.yml up --build
```

### Modo Producción
```powershell
docker-compose up --build -d
```

## 📋 Comandos con Makefile

Si tienes make instalado (en Windows con Git Bash, WSL o Chocolatey):

```bash
make dev          # Levantar desarrollo con hot-reload
make prod         # Levantar producción
make logs         # Ver logs en tiempo real
make down         # Detener servicios
make clean        # Limpiar todo (contenedores, imágenes, volúmenes)
```

## 🔧 Comandos Manuales

### Desarrollo

```powershell
# Levantar servicios
docker-compose -f docker-compose.dev.yml up --build

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f backend-dev

# Ejecutar migraciones
docker-compose -f docker-compose.dev.yml exec backend-dev npm run prisma:migrate

# Detener
docker-compose -f docker-compose.dev.yml down
```

### Producción

```powershell
# Levantar servicios
docker-compose up --build -d

# Ver logs
docker-compose logs -f backend

# Ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy

# Ver estado
docker-compose ps

# Detener
docker-compose down

# Limpiar todo (incluye volúmenes)
docker-compose down -v
```

## 🏗️ Arquitectura del Dockerfile

### Multi-Stage Build

El Dockerfile utiliza 3 etapas para optimizar:

1. **deps** - Instala solo dependencias de producción
2. **builder** - Compila TypeScript y genera Prisma Client
3. **runner** - Imagen final ligera con solo lo necesario

### Optimizaciones Aplicadas

✅ **Imagen Alpine** - Base mínima (~40MB)
✅ **Multi-stage build** - Reduce tamaño final (~150MB vs ~1GB)
✅ **Layer caching** - Aprovecha caché de Docker
✅ **Usuario no-root** - Mejora seguridad
✅ **Health checks** - Monitoreo de salud del contenedor
✅ **.dockerignore** - Excluye archivos innecesarios

## 🔍 Verificar Funcionamiento

Después de levantar los servicios:

```powershell
# Verificar que los contenedores estén corriendo
docker ps

# Probar el health check
curl http://localhost:4000/api/v1/health

# Ver documentación API
# Abrir en navegador: http://localhost:4000/api-docs
```

## 🗃️ Gestión de Base de Datos

### Primera vez (seed inicial)

```powershell
# Desarrollo
docker-compose -f docker-compose.dev.yml exec backend-dev npm run prisma:seed

# Producción
docker-compose exec backend npx prisma db seed
```

### Migraciones

```powershell
# Desarrollo - crear y aplicar migración
docker-compose -f docker-compose.dev.yml exec backend-dev npm run prisma:migrate

# Producción - solo aplicar migraciones
docker-compose exec backend npx prisma migrate deploy
```

### Acceder a Prisma Studio

```powershell
# Desde el contenedor
docker-compose exec backend npx prisma studio
```

## 🔒 Variables de Entorno

Las variables están configuradas en los archivos docker-compose*.yml. Para producción, considera usar:

- **Secrets de Docker Swarm**
- **Variables de entorno del sistema**
- **Archivos .env (no incluidos en git)**

### Variables Importantes

- DATABASE_URL - Conexión a PostgreSQL
- JWT_SECRET - Secret para tokens (cambiar en producción)
- CORS_ORIGIN - Origen permitido para CORS
- NODE_ENV - Entorno (development/production)

## 📊 Monitoreo

### Ver logs en tiempo real

```powershell
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo postgres
docker-compose logs -f postgres
```

### Estadísticas de recursos

```powershell
docker stats
```

## 🐛 Troubleshooting

### Puerto PostgreSQL ya en uso

Si tienes PostgreSQL instalado localmente (puerto 5432), Docker mapea al puerto **5433** para evitar conflictos. El `DATABASE_URL` en `.env` ya apunta a `localhost:5433`. Dentro de Docker Compose los servicios se comunican por el hostname `postgres` en el puerto interno 5432.

```powershell
# Verificar qué proceso usa el puerto 5432
netstat -ano | findstr :5432
```

### Puerto del backend ya en uso

```powershell
# Cambiar puerto en docker-compose.yml
ports:
  - "4001:4000"  # Mapea 4001 del host al 4000 del contenedor
```

### Problemas con migraciones

```powershell
# Resetear base de datos (⚠️ borra todos los datos)
docker-compose down -v
docker-compose up -d postgres
docker-compose exec backend npx prisma migrate deploy
```

### Reconstruir imagen desde cero

```powershell
docker-compose build --no-cache backend
```

## 🔄 Actualizar Dependencias

```powershell
# 1. Actualizar package.json en tu host
# 2. Reconstruir la imagen
docker-compose build backend
# 3. Reiniciar servicios
docker-compose up -d
```

## 🎯 Próximos Pasos

1. ✅ Ajustar JWT_SECRET para producción
2. ✅ Configurar reverse proxy (nginx/traefik)
3. ✅ Implementar SSL/TLS
4. ✅ Configurar CI/CD para builds automáticos
5. ✅ Implementar logs centralizados
6. ✅ Configurar backups de PostgreSQL

## 📚 Recursos

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Docker Guide](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)
