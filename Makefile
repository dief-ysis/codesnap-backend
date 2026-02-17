.PHONY: help build up down logs dev prod clean migrate-dev migrate-prod

help: ## Mostrar esta ayuda
	@echo "Comandos disponibles:"
	@echo "  make dev           - Levantar entorno de desarrollo con hot-reload"
	@echo "  make prod          - Levantar entorno de producción"
	@echo "  make build         - Construir imágenes Docker"
	@echo "  make up            - Levantar servicios (producción)"
	@echo "  make down          - Detener servicios"
	@echo "  make logs          - Ver logs en tiempo real"
	@echo "  make clean         - Limpiar contenedores, imágenes y volúmenes"
	@echo "  make migrate-dev   - Ejecutar migraciones en desarrollo"
	@echo "  make migrate-prod  - Ejecutar migraciones en producción"

dev: ## Modo desarrollo con hot-reload
	docker-compose -f docker-compose.dev.yml up --build

prod: ## Modo producción
	docker-compose up --build -d
	@echo "✅ Servicios levantados en producción"
	@echo "Backend: http://localhost:4000"
	@echo "API Docs: http://localhost:4000/api-docs"

build: ## Construir imágenes
	docker-compose build

up: ## Levantar servicios
	docker-compose up -d

down: ## Detener servicios
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

logs: ## Ver logs
	docker-compose logs -f

clean: ## Limpiar todo
	docker-compose down -v --rmi local
	docker-compose -f docker-compose.dev.yml down -v --rmi local
	@echo "✅ Limpieza completa"

migrate-dev: ## Migraciones en desarrollo
	docker-compose -f docker-compose.dev.yml exec backend-dev npm run prisma:migrate

migrate-prod: ## Migraciones en producción
	docker-compose exec backend npx prisma migrate deploy
