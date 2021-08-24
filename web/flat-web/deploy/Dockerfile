FROM nginx

WORKDIR /app

COPY web/flat-web/deploy/nginx /etc/nginx
COPY web/flat-web/dist /app

CMD ["nginx"]
