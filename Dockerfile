# Stage 1: Build Stage
FROM node:22 AS build

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
RUN yarn

COPY . .
RUN yarn build

# Stage 2: Runtime Stage
FROM node:22-alpine

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

ENV ENV=prod

CMD ["node", "dist/main.js"]