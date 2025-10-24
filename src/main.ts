import { monitor } from '@colyseus/monitor';
import { swaggerConfig } from '@config';
import { configEnv } from '@config/env.config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ColyseusService } from '@modules/colyseus/colyseus.service';

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

async function bootstrap() {
  try {
    const env = configEnv();
    const app = await setupNestApp();
    const colyseusService = app.get(ColyseusService);
    const { gameServer, httpServer } =  await colyseusService.initialize(app); 

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
