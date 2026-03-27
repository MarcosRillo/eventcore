# Stage 1: Build - install extensions and compilation dependencies
FROM php:8.3-fpm-bookworm AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev libjpeg62-turbo-dev libfreetype6-dev \
    libzip-dev libonig-dev libpq-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo_pgsql mbstring zip exif pcntl bcmath \
    && pecl install redis && docker-php-ext-enable redis \
    && pecl install pcov && docker-php-ext-enable pcov `# NOTE: PCOV is included so the same image can run tests in CI; move to a test-only stage if production image size becomes a concern` \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Stage 2: Production - clean image without build tools
FROM php:8.3-fpm-bookworm

# Copy compiled extensions from builder (no build-essential, git, vim, etc.)
COPY --from=builder /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=builder /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/

# Runtime dependencies only (libs, no -dev packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng16-16 libjpeg62-turbo libfreetype6 \
    libzip4 libonig5 libpq5 procps curl \
    && rm -rf /var/lib/apt/lists/*

# PHP config
RUN { echo 'memory_limit = 512M'; echo 'upload_max_filesize = 64M'; echo 'post_max_size = 64M'; } \
    > /usr/local/etc/php/conf.d/custom.ini

# PCOV config
RUN { echo '[pcov]'; echo 'pcov.enabled=1'; echo 'pcov.directory=/var/www/app'; \
    echo 'pcov.exclude="~vendor|tests|database|bootstrap|storage~"'; } \
    > /usr/local/etc/php/conf.d/pcov.ini

# PHP-FPM listen on all interfaces
RUN sed -i 's/listen = 127.0.0.1:9000/listen = 0.0.0.0:9000/' /usr/local/etc/php-fpm.d/www.conf

# Composer (pinned version)
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

# Non-root user
RUN groupadd -g 1000 www && useradd -u 1000 -ms /bin/bash -g www www

WORKDIR /var/www
COPY --chown=www:www . /var/www

# Create empty .env so Dotenv doesn't trigger file_get_contents warnings
RUN touch .env

# Entrypoint for storage:link (inline - script is tiny)
RUN printf '#!/bin/sh\nset -e\nphp artisan storage:link 2>/dev/null || true\nexec "$@"\n' \
    > /usr/local/bin/entrypoint.sh && chmod +x /usr/local/bin/entrypoint.sh

RUN chown www:www /var/www

USER www

RUN composer install --optimize-autoloader --no-interaction

EXPOSE 9000

ENTRYPOINT ["sh", "/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]
