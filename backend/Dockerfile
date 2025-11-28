FROM php:8.2-fpm

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    locales \
    zip \
    jpegoptim optipng pngquant gifsicle \
    vim \
    unzip \
    git \
    curl \
    libzip-dev \
    libonig-dev \
    libpq-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd \
    && docker-php-ext-install pdo_mysql \
    && docker-php-ext-install pdo_pgsql \
    && docker-php-ext-install mbstring \
    && docker-php-ext-install zip \
    && docker-php-ext-install exif \
    && docker-php-ext-install pcntl \
    && docker-php-ext-install bcmath \
    # Instalar PCOV para code coverage (más rápido que Xdebug)
    && pecl install pcov \
    && docker-php-ext-enable pcov \
    # Limpiar caché
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Configuración de PCOV para coverage
# - pcov.enabled=1 siempre activo (solo genera overhead con --coverage)
# - PCOV no afecta rendimiento si no se usa --coverage
# - Excluye vendor y directorios no relevantes
RUN { \
    echo '[pcov]'; \
    echo 'pcov.enabled=1'; \
    echo 'pcov.directory=/var/www/app'; \
    echo 'pcov.exclude="~vendor|tests|database|bootstrap|storage~"'; \
    } > /usr/local/etc/php/conf.d/pcov.ini

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Crear usuario del sistema para ejecutar comandos de Composer y Artisan
RUN groupadd -g 1000 www
RUN useradd -u 1000 -ms /bin/bash -g www www

# Establecer directorio de trabajo
WORKDIR /var/www

# Copiar archivos de la aplicación
COPY . /var/www

# Cambiar propietario de los archivos
RUN chown -R www:www /var/www

# Cambiar al usuario www
USER www

# Exponer puerto 9000 y iniciar servidor built-in de PHP para desarrollo
EXPOSE 9000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=9000"]
