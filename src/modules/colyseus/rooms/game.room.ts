import { Schema, type } from '@colyseus/schema';
import { Client, Room } from 'colyseus';

class Player extends Schema {
  @type("string") id: string = "";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
}

class GameState extends Schema {
  @type({ map: Player }) players = new Map<string, Player>();
}

export class GameRoom extends Room<GameState> {
  maxClients = 4; // Max players

  onCreate() {
    this.setState(new GameState());

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
      console.log(client.sessionId, 'sent', type, message);
    });

    console.log('Room created!', this.roomId);
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

  onJoin(client: Client) {
    const player = new Player();
    player.id = client.sessionId;
    player.x = 0;
    player.y = 0;
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
    console.log(`Player ${client.sessionId} left`);
  }

  onUncaughtException(err: Error, methodName: string) {
    console.error('An error ocurred in', methodName, ':', err);
  }
}
