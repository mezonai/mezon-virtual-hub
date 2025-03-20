import { ExtractAuthData, ExtractUserData } from '@colyseus/core/build/Room';
import { Schema, type } from '@colyseus/schema';
import { configEnv } from '@config/env.config';
import { Logger } from '@libs/logger';
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

class RoomState extends Schema {
  @type({ map: Player }) players = new Map<string, Player>();
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

    if (user.map.map_key !== this.roomName) {
      throw new ForbiddenException(
        `User is not allowed in this room: ${this.roomId}`,
      );
    }

    console.log(`User ${user.username} is allowed in ${this.roomId}`);
    client.userData = user;
    return true;
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
          anim: message.anim,
        });
      }
    });

    this.onMessage('*', (client, type, message) => {
      // Use the logger instead of console.log
      this.logger.log(`${client.sessionId} sent ${type}: ${message}`);
    });

    this.logger.log(`Room created! ${this.roomId}`);

    this.onMessage('chat', (client, message) => {
      console.log(
        `💬 [${client.sessionId}] ${message.sender}: ${message.text}`,
      );
      this.broadcast('chat', message);
    });

    this.onMessage('playerUpdateSkin', async (client, message) => {
      const skinArray = message.skin_set.split('/');
      const user = client.userData;

      if (user) {
        this.userRepository.update(user.id, { skin_set: message.skin_set });
      }

      this.broadcast('onPlayerUpdateSkin', {
        sessionId: client.sessionId,
        skin_set: skinArray,
      });
    });

    this.onMessage('chat', (client, message) => {
      this.broadcast('chat', message);
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

    this.logger.log(
      `Player ${userData?.username} joined room ${this.roomName}`,
    );

    const player = new Player();
    player.id = client.sessionId;
    player.x = userData?.position_x ?? 0;
    player.y = userData?.position_y ?? 0;
    player.display_name = userData?.display_name || userData?.username || '';
    player.skin_set = userData?.skin_set.join('/') || '';

    this.state.players.set(client.sessionId, player);
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
      this.broadcast('playerLeft', client.sessionId);
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
