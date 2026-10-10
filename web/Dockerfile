FROM httpd:2.4.69-alpine

# ベースイメージ同梱の Alpine パッケージの既知脆弱性 (expat / nghttp2 / perl) を修正版へ更新する
RUN apk upgrade --no-cache && \
    sed -i '/LoadModule rewrite_module/s/^#//g' /usr/local/apache2/conf/httpd.conf && \
    sed -i 's/AllowOverride None/AllowOverride All/g' /usr/local/apache2/conf/httpd.conf && \
    sed -i 's/^Listen 80$/Listen 8080/' /usr/local/apache2/conf/httpd.conf && \
    chown -R daemon:daemon /usr/local/apache2/logs

EXPOSE 8080

USER daemon
