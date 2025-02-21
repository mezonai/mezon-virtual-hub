import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Server } from 'colyseus';
import { createServer } from 'http';
import { GameRoom } from './rooms/game.room';

@Module({
  providers: [],
})
export class ColyseusModule implements OnModuleInit, OnModuleDestroy {
  private gameServer: Server;

  onModuleInit() {
    const httpServer = createServer();
    this.gameServer = new Server({ server: httpServer });

    this.gameServer.define('game_room', GameRoom);

    this.gameServer.listen(3001);
    console.log('Colyseus WebSocket server running on ws://localhost:3001');
  }

  onModuleDestroy() {
    console.log('Shutting down Colyseus server...');
    this.gameServer.gracefullyShutdown();
  }
}
