import { Schema, type } from '@colyseus/schema';
import { Client, Room } from 'colyseus';
import { Logger } from '@libs/logger';


class Player extends Schema {
  @type("string") id: string = "";
  @type("string") name: string = "";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
}

class RoomState extends Schema {
  @type({ map: Player }) players = new Map<string, Player>();
}

export class GameRoom extends Room<RoomState> {
  maxClients = 50; // Max players

  constructor(
    private readonly logger: Logger
  ) {
    super();
    this.logger.log(`GameRoom created : ${this.roomName}`);
  }

  onCreate() {
    this.setState(new RoomState());

    this.onMessage('move', (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = message.x || 0;
        player.y = message.y || 0;
        this.broadcast('updatePosition', {
          id: client.sessionId,
          x: player.x,
          y: player.y,
          sX: message.sX,
          anim: message.anim
        });
      }
    });

    this.onMessage('*', (client, type, message) => {
      // Use the logger instead of console.log
      this.logger.log(`${client.sessionId} sent ${type}: ${message}`);
    });

    this.logger.log(`Room created! ${this.roomId}`);
  }

  onBeforePatch() {
    //
    // here you can mutate something in the state just before it is encoded &
    // synchronized with all clients
    //
  }

  onBeforeShutdown() {
    //
    // Notify users that process is shutting down, they may need to save their progress and join a new room
    //
    this.broadcast(
      'going-down',
      'Server is shutting down. Please save your progress and join a new room.',
    );

    //
    // Disconnect all clients after 5 minutes
    //
    this.clock.setTimeout(() => this.disconnect(), 5 * 60 * 1000);
  }

  onJoin(client: Client, options: any, auth: any) {
    this.logger.log(`Player ${client.sessionId} joined room ${this.roomName}`);
    const player = new Player();
    player.id = client.sessionId;
    player.x = 0;
    player.y = 0;
    player.name = client.userData?.name || 'Guest ' + client.sessionId;

    this.state.players.set(client.sessionId, player);
    this.broadcast('newPlayer', {
      id: client.sessionId,
      x: player.x,
      y: player.y,
      name: player.name,
    });
  }

  onLeave(client: Client) {
    if (this.state.players.has(client.sessionId)) {
      this.broadcast('playerLeft', client.sessionId);
      this.state.players.delete(client.sessionId);
    }
    this.logger.log(`Player ${client.sessionId} left room ${this.roomName}`);
  }

  onUncaughtException(err: Error, methodName: string) {
    this.logger.error(`An error occurred in ${methodName}: ${err}`, err.stack || 'No stack trace');
  }
}
