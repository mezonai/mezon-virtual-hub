# Stage 1: Build Stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
RUN yarn

COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY ../nginx_admin.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]