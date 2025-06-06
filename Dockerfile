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
RUN mkdir -p /app/logs

ENV ENV=prod

CMD ["sh", "-c", "node dist/main.js > /app/logs/output.log 2>&1"]