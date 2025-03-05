import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Server } from 'colyseus';
import { GameRoom } from './rooms/game.room';
import { Inject } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { configEnv } from '@config/env.config';

@Module({
  providers: [],
  imports: [NestApplication],
})
export class ColyseusModule implements OnModuleInit, OnModuleDestroy {
  private gameServer: Server;

  constructor(@Inject(NestApplication) private readonly app: NestApplication) {}

  onModuleInit() {
    const httpServer = this.app.getHttpServer();

    this.gameServer = new Server({ server: httpServer });

    this.gameServer.define('my_room', GameRoom);

    this.gameServer.listen(+configEnv().GAME_PORT);
    console.log('Colyseus WebSocket server running on ws://localhost:8001');
  }

  onModuleDestroy() {
    console.log('Shutting down Colyseus server...');
    this.gameServer.gracefullyShutdown();
  }
}
