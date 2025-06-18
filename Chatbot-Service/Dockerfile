FROM php:8.2-apache

# Instala extensiones necesarias
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libonig-dev \
    libcurl4-openssl-dev \
    && docker-php-ext-install zip mbstring curl

# Instala Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copia archivos del proyecto
WORKDIR /var/www/html
COPY . .

# Instala dependencias de PHP (asegúrate de tener composer.json en tu proyecto)
RUN composer install

# Exponer puerto
EXPOSE 80
