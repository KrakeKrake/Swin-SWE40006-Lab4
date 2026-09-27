# Inspired by: https://www.geeksforgeeks.org/devops/how-to-dockerize-a-reactjs-app/
FROM node:alpine AS builder
LABEL authors="Adam Hanna"

WORKDIR /web-app

COPY ./package*.json /web-app
RUN npm install

COPY . .
RUN npm run build
FROM nginx
COPY --from=builder /web-app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80


