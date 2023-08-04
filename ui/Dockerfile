FROM node:18-buster as build
USER node
COPY --chown=node . /ui/

WORKDIR /ui
RUN npm install
RUN npm run build

FROM nginx
RUN mkdir -p /etc/nginx/templates
COPY deploy/default.conf /etc/nginx/templates/default.conf.template
COPY --from=build /ui/dist/ /usr/share/nginx/html


