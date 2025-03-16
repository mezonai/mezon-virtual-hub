import { swaggerConfig } from '@config';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createServer } from 'http';
import { configEnv } from '@config/env.config';
import { Server } from '@colyseus/core';
import { GameRoom } from '@modules/colyseus/rooms/game.room';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { monitor } from "@colyseus/monitor";

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

async function setupColyseusServer() {
  const httpServer = createServer();
  const gameServer = new Server({
    transport: new WebSocketTransport({
      server: httpServer,
      pingInterval: 5000, // Send ping every 5 seconds
      pingMaxRetries: 3,  // Disconnect after 3 failed pings
    }),
  });
  
  gameServer.define('my_room', GameRoom);
  return { gameServer, httpServer };
}

async function bootstrap() {
  try {
    const env = configEnv();
    const app = await setupNestApp();
    const { gameServer, httpServer } = await setupColyseusServer();

    /**
     * Bind @colyseus/monitor
     * It is recommended to protect this route with a password.
     * Read more: https://docs.colyseus.io/tools/monitor/
     */
    app.use("/colyseus", monitor());

    // Start HTTP server
    await app.listen(env.PORT);
    logger.log(`HTTP server running on http://localhost:${env.PORT}/api`);

    // Start WebSocket server
    await new Promise<void>((resolve) => {
      httpServer.listen(env.GAME_PORT, () => {
        logger.log(`Colyseus WebSocket server running on ws://localhost:${env.GAME_PORT}`);
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
        app.close()
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
