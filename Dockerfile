FROM php:8.2-apache

# Enable mod_rewrite
RUN a2enmod rewrite

# Copy files
COPY . /var/www/html/

# Set permissions
RUN chown -R www-data:www-data /var/www/html

# Use the PORT environment variable from Render
ENV APACHE_RUN_USER=www-data
ENV APACHE_RUN_GROUP=www-data
ENV APACHE_LOG_DIR=/var/log/apache2

# Copy a custom Apache config to use the correct port
RUN echo "Listen 0.0.0.0:${PORT:-10000}" >> /etc/apache2/ports.conf && \
    echo "ServerName localhost" >> /etc/apache2/apache2.conf

EXPOSE ${PORT:-10000}