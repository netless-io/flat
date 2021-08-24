FROM nginx

WORKDIR /app

RUN ls -a
RUN ls -a web
RUN ls -a web/flat-web
RUN ls -a web/flat-web/deploy
RUN ls -a web/flat-web/deploy/nginx
COPY web/flat-web/deploy/nginx /etc/nginx
COPY web/flat-web/dist /app

CMD ["nginx"]
