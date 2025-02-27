import { swaggerConfig } from '@config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createServer } from 'http';
import config from '@config/env.config';
import { Server } from '@colyseus/core';
import { GameRoom } from '@modules/colyseus/rooms/game.room';
import { WebSocketTransport } from '@colyseus/ws-transport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  swaggerConfig(app);
  await app.listen(config().PORT);
  console.log(`HTTP server running on http://localhost:${config().PORT}/api`);

  const gameServer = new Server({
    transport: new WebSocketTransport({
      server: createServer(),
    }),
  });
  gameServer.define('my_room', GameRoom);

  gameServer.listen(+config().GAME_PORT);
  console.log(
    `Colyseus WebSocket server running on ws://localhost:${config().GAME_PORT}`,
  );
}

bootstrap();
