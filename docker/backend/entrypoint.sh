#!/bin/sh
set -e

# Create empty .env if missing (Docker volume may exclude dotenv files)
[ -f /var/www/.env ] || touch /var/www/.env 2>/dev/null || true

# Crear symlink storage si no existe (idempotente)
php artisan storage:link 2>/dev/null || true

# Ejecutar el CMD del Dockerfile (php-fpm o artisan serve)
exec "$@"
