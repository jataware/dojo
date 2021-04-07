
FROM node:15-buster

WORKDIR /usr/src/app
COPY app/package*.json ./
RUN npm install
COPY app/server server/
CMD ["npm", "run", "prod-server"]