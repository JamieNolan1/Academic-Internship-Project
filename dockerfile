FROM php:8.2-apache

RUN a2enmod rewrite

# Copy the Apache config file (create this next)
COPY apache-config.conf /etc/apache2/sites-available/000-default.conf

COPY . /var/www/html/

RUN chown -R www-data:www-data /var/www/html

EXPOSE 10000