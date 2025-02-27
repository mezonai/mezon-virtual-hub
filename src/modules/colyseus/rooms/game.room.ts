import { MapSchema, Schema, type } from '@colyseus/schema';
import { Client, Room } from 'colyseus';

class Player extends Schema {
  @type("string", { manual: false }) id: string = "";
  @type("number", { manual: false }) x: number = 0;
  @type("number", { manual: false }) y: number = 0;
}

class GameState extends Schema {
  @type({ map: Player }) players = new Map<string, Player>();
  // createPlayer(id: string) {
  //   console.log("create new player: " + id );
  //   this.players.set(
  //     id,
  //     new Player().assign({
  //       id,
  //       x: 0,
  //       y: 0
  //     }),
  //   );
  // }
}

export class GameRoom extends Room<GameState> {
  maxClients = 4; // Max players

  onCreate() {
    this.setState(new GameState());
    
    this.onMessage('move', (client, message) => {
      console.log(`Received move from ${client.sessionId}:`, message);
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = message.x || 0;
        player.y = message.y || 0;
        console.log(`Updated player position:`, { x: player.x, y: player.y });

        this.broadcast('updatePosition', {
          id: client.sessionId,
          x: player.x,
          y: player.y,
        });
      }
    });

    this.onMessage('*', (client, type, message) => {
      //
      // Triggers when any other type of message is sent,
      // excluding "action", which has its own specific handler defined above.
      //
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
    // this.state.createPlayer(client.sessionId);
    this.state.players.set(client.sessionId, player);
    console.log(`Player ${client.sessionId} joined`, player);
    // console.log("Player added:", this.state.players);
    setTimeout(() => {
      console.log(this.state.toJSON())
    }, 1000);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
    console.log(`Player ${client.sessionId} left`);
  }

  onUncaughtException(err: Error, methodName: string) {
    console.error('An error ocurred in', methodName, ':', err);
  }
}
