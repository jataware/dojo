FROM nginx
RUN mkdir -p /etc/nginx/templates
COPY deploy/default.conf /etc/nginx/templates/default.conf.template
COPY ui/dist /usr/share/nginx/html
