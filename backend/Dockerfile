FROM php:8.2.29-fpm

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
    procps \
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
RUN { \
    echo '[pcov]'; \
    echo 'pcov.enabled=1'; \
    echo 'pcov.directory=/var/www/app'; \
    echo 'pcov.exclude="~vendor|tests|database|bootstrap|storage~"'; \
    } > /usr/local/etc/php/conf.d/pcov.ini

# Configuración PHP personalizada
RUN { \
    echo 'memory_limit = 512M'; \
    echo 'upload_max_filesize = 64M'; \
    echo 'post_max_size = 64M'; \
    } > /usr/local/etc/php/conf.d/custom.ini

# Configurar PHP-FPM para escuchar en todas las interfaces
RUN sed -i 's/listen = 127.0.0.1:9000/listen = 0.0.0.0:9000/' /usr/local/etc/php-fpm.d/www.conf

# Instalar Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Crear usuario del sistema para ejecutar comandos de Composer y Artisan
RUN groupadd -g 1000 www \
    && useradd -u 1000 -ms /bin/bash -g www www

# Establecer directorio de trabajo
WORKDIR /var/www

# Copiar archivos de la aplicación
COPY --chown=www:www . /var/www

# Cambiar al usuario www
USER www

# Exponer puerto 9000 (FastCGI)
EXPOSE 9000

# PHP-FPM como proceso principal (NO artisan serve)
CMD ["php-fpm"]
