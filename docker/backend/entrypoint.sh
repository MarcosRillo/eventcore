#!/bin/sh
set -e

# Crear symlink storage si no existe (idempotente)
php artisan storage:link 2>/dev/null || true

# Ejecutar el CMD del Dockerfile (php-fpm o artisan serve)
exec "$@"
