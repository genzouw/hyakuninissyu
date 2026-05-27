FROM httpd:2.4.43-alpine

RUN sed -i '/LoadModule rewrite_module/s/^#//g' /usr/local/apache2/conf/httpd.conf
RUN sed -i 's/AllowOverride None/AllowOverride All/g' /usr/local/apache2/conf/httpd.conf
RUN sed -i 's/^Listen 80$/Listen 8080/' /usr/local/apache2/conf/httpd.conf

RUN chown -R www-data:www-data /usr/local/apache2/logs

EXPOSE 8080

USER www-data
