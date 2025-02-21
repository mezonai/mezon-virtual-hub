import { swaggerConfig } from '@config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Server } from 'colyseus';
import { createServer } from 'http';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const server = createServer(app.getHttpServer());

  swaggerConfig(app);

  const gameServer = new Server({ server });

  await app.init();

  gameServer.listen(3000).catch((error) => {
    console.error('Error starting the game server:', error);
  });

  console.log(
    `Server running: HTTP on http://localhost:3000, WebSocket on ws://localhost:3000`,
  );
}

bootstrap();
