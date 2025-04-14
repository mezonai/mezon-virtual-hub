import { Schema, type } from '@colyseus/schema';
import { configEnv } from '@config/env.config';
import { GoogleGenAI } from '@google/genai';
import { Logger } from '@libs/logger';
import { cleanAndStringifyJson, isValidJsonQuiz } from '@libs/utils';
import { JwtPayload } from '@modules/auth/dtos/response';
import { GameEventService } from '@modules/game-event/game-event.service';
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
import { Player } from '@types';
import { Client, Room } from 'colyseus';
import { IncomingMessage } from 'http';
import { Repository } from 'typeorm';

class Item extends Schema {
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('string') type: string = '';
  @type('string') ownerId: string = '';

  constructor(x: number = 0, y: number = 0, type: string = '', ownerId: string = '') {
    super();
    this.x = x;
    this.y = y;
    this.type = type;
    this.ownerId = ownerId;
  }
}

class RoomState extends Schema {
  @type({ map: Player }) players = new Map<string, Player>();
  @type({ map: Item }) items = new Map<string, Item>();
}

@Injectable()
export class BaseGameRoom extends Room<RoomState> {
  maxClients = 50; // Max players
  logger = new Logger();
  static activeRooms: Set<BaseGameRoom> = new Set();
  static globalTargetClients: Map<string, Client> = new Map();
  constructor(
    @InjectRepository(UserEntity)
    readonly userRepository: Repository<UserEntity>,
    @Inject() private readonly jwtService: JwtService,
    @Inject() private readonly gameEventService: GameEventService,
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

  broadcastToAllRooms(type: string, data: any) {
    BaseGameRoom.activeRooms.forEach(room => {
      room.broadcast(type, data);
      console.log("Room broadcast: ", room.roomId);
    });
  }

  private decodeMoveData(buffer: Uint8Array) {
    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength,
    );
    const x = view.getInt16(0, true);
    const y = view.getInt16(2, true);
    const sX = view.getInt8(4);

    const animBytes = buffer.slice(5);
    const anim = new TextDecoder().decode(animBytes);

    return { x, y, sX, anim };
  }

  private encodeMoveData(
    sessionId: string,
    x: number,
    y: number,
    sX: number,
    anim: string,
  ): Uint8Array {
    const sessionBytes = new TextEncoder().encode(sessionId);
    const animBytes = new TextEncoder().encode(anim);

    const totalSize = 6 + sessionBytes.length + animBytes.length;
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
    if (this.roomName == "sg") {
      this.state.items.set('car1', new Item(355, -120, 'gokart', ''));
      this.state.items.set('car2', new Item(235, -120, 'gokart', ''));
    }
    BaseGameRoom.activeRooms.add(this);
    this.onMessage('move', (client, buffer: ArrayBuffer) => {
      try {
        const data = this.decodeMoveData(new Uint8Array(buffer));
        const player = this.state.players.get(client.sessionId);
        if (player) {
          player.assign({
            x: data.x,
            y: data.y,
          });

          this.broadcast(
            'updatePosition',
            this.encodeMoveData(
              client.sessionId,
              data.x,
              data.y,
              data.sX,
              data.anim,
            ),
          );
        }
      } catch (error) {
        this.logger.error('Error decoding move data', error);
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

    this.onMessage('useItem', (client, message) => {
      const item = this.state.items.get(message.itemId);
      if (item) {
        item.ownerId = message.playerId;
        if (message.x) {
          item.x = message.x;
        }
        if (message.y) {
          item.y = message.y;
        }
        this.broadcast('onUseItem', message);
      }
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

    this.onMessage('arrest', async (client, message) => {
      const user = client.userData;
      if (!message?.targetUserId) return;

      // await this.userRepository.update(message.targetUserId, {
      //   is_captured: true,
      // });

      this.logger.log(`${user?.username} arrested ${message.targetUserId}`);

      this.broadcastToAllRooms('userCaughtglobal', {
        by: user?.id,
        target: message.targetUserId,
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

  onLeave(client: Client<UserEntity>) {
    const { userData } = client;
    let userId =  userData == null ? "0" :  userData?.id;
    if (BaseGameRoom.globalTargetClients.has(userId)) {
      BaseGameRoom.globalTargetClients.delete(userId);
    }
    if (this.state.players.has(client.sessionId)) {
      this.resetMapItem(client, this.state.players.get(client.sessionId));
      this.state.players.delete(client.sessionId);
    }
    this.logger.log(`Player ${userData?.username} left room ${this.roomName}`);
  }

  resetMapItem(client: Client<UserEntity>, player: Player | undefined) {
    for (const item of this.state.items) {
      if (client.sessionId == item[1].ownerId) {
        item[1].ownerId = "";
        if (player) {
          item[1].x = player?.x;
          item[1].y = player?.y;
        }
        this.broadcast('onUseItem', { itemId: item[0], playerId: ''});
        break;
      }
    }
  }

  onUncaughtException(err: Error, methodName: string) {
    this.logger.error(
      `An error occurred in ${methodName}: ${err}`,
      err.stack || 'No stack trace',
    );
  }

  async onJoin(client: Client<UserEntity>, options: any, auth: any) {
    const { userData } = client;
    let event = await this.gameEventService.findUpcoming();
    console.log("Event: ", event?.target_user.username);
    //let userId =  userData == null ? "0" :  userData?.id;
    // if (this.isTargetUser(client)) {
    //   if (!BaseGameRoom.globalTargetClients.has(userId)) {
    //     BaseGameRoom.globalTargetClients.set(userId, client);
    //   }
    //   this.broadcastToAllRooms('userTargetJoined', {
    //     userId: userData?.id,
    //     username: userData?.username,
    //     room: this.roomName,
    //   });
    // } else {
    //   if (BaseGameRoom.globalTargetClients.has("target-session-id")) {
    //     client.send('userTargetJoined', {
    //       userId: userData?.id,
    //     username: userData?.username,
    //     room: this.roomName,
    //     });
    //   }
    // }    
    // this.broadcastToAllRooms('userTargetJoined', {
    //   userId: userData?.id,
    //   username: userData?.username,
    //   room: this.roomName,
    // });
  }

  onDispose() {
    BaseGameRoom.activeRooms.delete(this);
  }

  private isTargetUser(client: Client): boolean {
    return client.sessionId === "target-session-id";
  }
}
