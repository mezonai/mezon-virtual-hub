import { Room, Server } from '@colyseus/core';
import { monitor } from '@colyseus/monitor';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { swaggerConfig } from '@config';
import { configEnv } from '@config/env.config';
import { SUB_GAME_ROOM } from '@constant';
import { GameRoom } from '@modules/colyseus/rooms/game.room';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createServer } from 'http';
import { AppModule } from './app.module';
import { MapKey } from './enum/entity.enum';

const logger = new Logger('Bootstrap');

async function setupNestApp() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: configEnv().ALLOWED_ORIGINS || true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  swaggerConfig(app);
  return app;
}

function defineRoomWithPaths(
  gameServer: Server,
  app: INestApplication<any>,
  baseKey: string,
  rooms = SUB_GAME_ROOM,
  parentPath = ""
) {
  Object.entries(rooms).forEach(([subPath, config]) => {
    const roomPath = `${baseKey}${parentPath}${subPath ? `/${subPath}` : ""}`.replace(/\/+/g, "/"); // Ensure proper path format

    gameServer.define(roomPath, injectDeps(app, config.room));
    logger.log(`Defined game room: ${roomPath}`);

    if (config.children) {
      Object.entries(config.children).forEach(([childKey, childConfig]) => {
        defineRoomWithPaths(gameServer, app, baseKey, { [childKey]: childConfig }, `${parentPath}/${subPath}`);
      });
    }
  });
}
async function setupColyseusServer(app: INestApplication<any>) {
  const httpServer = createServer();
  const gameServer = new Server({
    transport: new WebSocketTransport({
      server: httpServer,
      pingInterval: 5000, // Send ping every 5 seconds
      pingMaxRetries: 3, // Disconnect after 3 failed pings
    }),
  });

  // Define GameRoom for all MapKey values
  Object.values(MapKey).forEach((mapKey) => {
    defineRoomWithPaths(gameServer, app, mapKey);
  });
  return { gameServer, httpServer };
}

function injectDeps<T extends { new (...args: any[]): Room }>(
  app: INestApplication,
  target: T,
): T {
  const selfDeps = Reflect.getMetadata('self:paramtypes', target) || [];
  const dependencies = Reflect.getMetadata('design:paramtypes', target) || [];

  selfDeps.forEach((dep: any) => {
    dependencies[dep.index] = dep.param;
  });

  const injectables =
    dependencies.map((dependency: any) => {
      return app.get(dependency);
    }) || [];

  return class extends target {
    constructor(...args: any[]) {
      super(...injectables);
    }
  };
}

async function bootstrap() {
  try {
    const env = configEnv();
    const app = await setupNestApp();
    const { gameServer, httpServer } = await setupColyseusServer(app);

    /**
     * Bind @colyseus/monitor
     * It is recommended to protect this route with a password.
     * Read more: https://docs.colyseus.io/tools/monitor/
     */
    app.use('/colyseus', monitor());

    // Start HTTP server
    await app.listen(env.PORT);
    logger.log(`HTTP server running on http://localhost:${env.PORT}/api`);

    logger.log(
      `Colyseus WebSocket server running on ws://localhost:${env.GAME_PORT}`,
    );

    // Start WebSocket server
    await new Promise<void>((resolve) => {
      httpServer.listen(env.GAME_PORT, () => {
        resolve();
      });
    });

    // Handle shutdown gracefully
    const shutdown = async () => {
      logger.log('Shutting down services...');

      await Promise.all([
        new Promise<void>((resolve) => {
          gameServer.gracefullyShutdown().then(() => {
            logger.log('Colyseus server shut down');
            resolve();
          });
        }),
        app.close(),
      ]);

      logger.log('All services shut down successfully');
      process.exit(0);
    };

    // Listen for termination signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error(`Error during bootstrap: ${error.message}`, error.stack);
    process.exit(1);
  }
}

bootstrap();
