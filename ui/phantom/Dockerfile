FROM nginx
RUN mkdir -p /etc/nginx/templates
COPY phantom/default.conf /etc/nginx/templates/default.conf.template
COPY ui/dist /usr/share/nginx/html
