import { ExtractAuthData, ExtractUserData } from '@colyseus/core/build/Room';
import { Schema, type } from '@colyseus/schema';
import { configEnv } from '@config/env.config';
import { SUB_GAME_ROOM } from '@constant';
import { Logger } from '@libs/logger';
import { flattenRooms } from '@libs/utils/mapper';
import { JwtPayload } from '@modules/auth/dtos/response';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Client, Room } from 'colyseus';
import { IncomingMessage } from 'http';
import { Repository } from 'typeorm';

class Player extends Schema {
  @type('string') id: string = '';
  @type('string') display_name: string = '';
  @type('string') skin_set: string = '';
  @type('number') x: number = 0;
  @type('number') y: number = 0;
}

class Item extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("string") type: string = "";
}

class RoomState extends Schema {
  @type({ map: Player }) players = new Map<string, Player>();
  @type({ map: Item }) items = new Map<string, Item>();
}

@Injectable()
export class GameRoom extends Room<RoomState> {
  maxClients = 50; // Max players
  logger = new Logger();
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @Inject() private readonly jwtService: JwtService,
  ) {
    super();
    this.logger.log(`GameRoom created : ${this.roomName}`);
  }

  verifyJwt(token: string): JwtPayload {
    try {
      const payload: JwtPayload = this.jwtService.verify(token, {
        secret: configEnv().JWT_ACCESS_TOKEN_SECRET,
      });

      const { expireTime, username } = payload;

      const expireDate = new Date(expireTime);
      const now = new Date().getTime();

      if (
        !expireTime ||
        isNaN(expireDate.getTime()) ||
        now > expireDate.getTime()
      ) {
        throw new ForbiddenException(
          'Your session has expired. Please log in again to continue.',
        );
      }

      return payload;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new UnauthorizedException();
    }
  }

  async onAuth(
    client: Client,
    options: { accessToken: string },
    request?: IncomingMessage,
  ) {
    const { username, email } = this.verifyJwt(options.accessToken);

    const user = await this.userRepository.findOne({
      where: [{ username }, { email }],
      relations: ['map'],
    });

    if (!user || !user.map) {
      throw new NotFoundException('User not found or not assigned to any map');
    }

    if (!this.roomName.startsWith(user.map.map_key)) {
      throw new ForbiddenException(
        `User is not allowed in this room: ${this.roomName}`,
      );
    }

    console.log(`User ${user.username} is allowed in ${this.roomId}`);
    client.userData = user;
    return true;
  }

  private decodeMoveData(buffer: Uint8Array) {
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const x = view.getInt16(0, true);
    const y = view.getInt16(2, true);
    const sX = view.getInt8(4);

    const animBytes = buffer.slice(5);
    const anim = new TextDecoder().decode(animBytes);

    return { x, y, sX, anim };
  }

  private encodeMoveData(sessionId: string, x: number, y: number, sX: number, anim: string): Uint8Array {
    const sessionBytes = new TextEncoder().encode(sessionId);
    const animBytes = new TextEncoder().encode(anim);

    const totalSize = 6 + sessionBytes.length + animBytes.length;
    console.log(totalSize)
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    const uint8Array = new Uint8Array(buffer);

    view.setInt16(0, x, true);
    view.setInt16(2, y, true);
    view.setInt8(4, sX);
    view.setUint8(5, sessionBytes.length);

    uint8Array.set(sessionBytes, 6);

    uint8Array.set(animBytes, 6 + sessionBytes.length);

    return uint8Array;
  }

  onCreate() {
    this.setState(new RoomState());
    this.state.items.set("car1", new Item({ x: 100, y: 200, type: "gokart" }));
    this.state.items.set("car2", new Item({ x: 300, y: 400, type: "gokart" }));

    this.onMessage("move", (client, buffer: ArrayBuffer) => {
      try {
        const data = this.decodeMoveData(new Uint8Array(buffer));
        const player = this.state.players.get(client.sessionId);
        if (player) {
          player.assign({
            x: data.x,
            y: data.y
          });

          this.broadcast("updatePosition", this.encodeMoveData(client.sessionId, data.x, data.y, data.sX, data.anim));
        }
      } catch (error) {
        this.logger.error("Error decoding move data", error);
        return;
      }
    });


    this.onMessage('*', (client, type, message) => {
      // Use the logger instead of console.log
      this.logger.log(`${client.sessionId} sent ${type}: ${message}`);
    });

    this.logger.log(`Room created! ${this.roomId}`);

    this.onMessage('chat', (client, buffer) => {
      this.broadcast('chat', buffer);
    });

    this.onMessage('playerUpdateSkin', async (client, message) => {
      const skinArray = message.skin_set.split('/');
      const user = client.userData;

      if (user) {
        this.userRepository.update(user.id, { skin_set: skinArray });
      }

      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.skin_set = skinArray.join('/');
      }

      this.broadcast('onPlayerUpdateSkin', {
        sessionId: client.sessionId,
        skin_set: skinArray,
      });
    });
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

  onJoin(client: Client<UserEntity>, options: any, auth: any) {
    const { userData } = client;
  
    this.logger.log(`Player ${userData?.username} joined room ${this.roomName}`);
  
    const roomSegments = this.roomName.split('/');
    const finalRoom = roomSegments[roomSegments.length - 1];
  
    const flatRooms = flattenRooms(SUB_GAME_ROOM);
    const room = flatRooms[finalRoom];
  
    // Create player object and set position based on found room or user data
    const player = new Player();
    player.id = client.sessionId;
  
    if (room?.default_position_x && room?.default_position_y) {
      player.x = room.default_position_x;
      player.y = room.default_position_y;
    } else {
      player.x = userData?.position_x ?? 0;
      player.y = userData?.position_y ?? 0;
    }
  
    player.display_name = userData?.display_name || userData?.username || '';
    player.skin_set = userData?.skin_set?.join('/') || '';
  
    this.state.players.set(client.sessionId, player);
    this.logger.log(`Player ${userData?.username} has position ${player.x} ${player.y}`);
  }

  onLeave(client: Client<UserEntity>) {
    const { userData } = client;
    if (userData) {
      const positionUpdate = {
        position_x: Math.floor(
          this.state.players.get(client.sessionId)?.x || 0,
        ),
        position_y: Math.floor(
          this.state.players.get(client.sessionId)?.y || 0,
        ),
      };

      this.userRepository.update(userData.id, positionUpdate);
    }

    if (this.state.players.has(client.sessionId)) {
      this.state.players.delete(client.sessionId);
    }
    this.logger.log(`Player ${userData?.username} left room ${this.roomName}`);
  }

  onUncaughtException(err: Error, methodName: string) {
    this.logger.error(
      `An error occurred in ${methodName}: ${err}`,
      err.stack || 'No stack trace',
    );
  }
}
