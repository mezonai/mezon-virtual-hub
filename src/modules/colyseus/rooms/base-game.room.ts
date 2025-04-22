import { Schema, type } from '@colyseus/schema';
import { configEnv } from '@config/env.config';
import { RPS_FEE } from '@constant';
import { ActionKey } from '@enum';
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

export class Item extends Schema {
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
  private minigameResultDict = new Map();
  // maxClients = 50; // Max players
  logger = new Logger();
  static activeRooms: Set<BaseGameRoom> = new Set();
  static globalTargetClients: Map<string, Client> = new Map();
  static eventData: any;
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

  createKeyForActionDict(gameType, p1, p2) {
    return gameType + "-" + p1 + "-" + p2;
  }

  sendMessageToTarget(client: Client, action, message) {
    client.send("noticeMessage", { action: action, message: message });
  }

  getRPSWinner(p1, p2, result1, result2) {
    if (result1 === result2) {
      return "draw";
    }

    const winsAgainst = {
      rock: "scissors",
      paper: "rock",
      scissors: "paper"
    };

    if (winsAgainst[result1] === result2) {
      return p1;
    } else {
      return p2;
    }
  }

  async onCreate() {
    this.setState(new RoomState());
    BaseGameRoom.activeRooms.add(this);
    if (!BaseGameRoom.eventData) {
      BaseGameRoom.eventData = await this.gameEventService.findOneCurrentEvent();
      console.log("Event: ", BaseGameRoom.eventData);
    }
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

    this.onMessage('catchTargetUser', async (client, data) => {
      this.broadcastToAllRooms('updateProgresCatchTargetUser', {
        sessionId: client.sessionId
      });
    });

    this.onMessage('onPlayerUpdateGold', (client, data) => {
      const { newValue, amountChange, needUpdate } = data;
      if (client?.userData?.gold != null) {
        if (newValue >= 0) {
          client.userData.gold = newValue;
        }

        if (needUpdate && client?.userData) {
          this.userRepository.update(client.userData.id, { gold: newValue });
        }

        let responseData = {
          sessionId: client.sessionId,
          amountChange: amountChange
        }
        this.broadcast('onPlayerUpdateGold', responseData);
      }
    });

    this.onMessage("p2pAction", (sender, data) => {
      const { targetClientId, action, amount } = data;

      if (action == ActionKey.RPS.toString() && sender.userData?.gold < RPS_FEE) {
        this.sendMessageToTarget(sender, action, "Không đủ tiền");
        return;
      }

      const targetClient = this.clients.find(client => client.sessionId === targetClientId);
      for (let key of this.minigameResultDict.keys()) {
        if (key.includes(sender.sessionId) || targetClient?.userData == null) {
          this.sendMessageToTarget(sender, action, "Không thể mời người chơi này");
          return;
        }
      }

      if (targetClient && action == ActionKey.RPS.toString() && (targetClient.userData.gold < RPS_FEE)) {
        this.sendMessageToTarget(sender, action, "Người chơi không đủ tiền");
        return;
      }


      if (action == ActionKey.SendCoin.toString()) {
        if (amount <= 0 || sender.userData?.gold <= 0 || sender.userData?.gold < amount) {
          this.sendMessageToTarget(sender, action, "Không đủ tiền");
          return;
        }

        if (sender.userData && targetClient?.userData && (sender.userData.id != targetClient?.userData.id)) {
          sender.userData.gold -= amount;
          targetClient.userData.gold += amount;

          this.userRepository.update(sender.userData.id, { gold: sender.userData.gold });
          this.userRepository.update(targetClient.userData.id, { gold: targetClient.userData.gold });
        }
        else {
          this.sendMessageToTarget(sender, action, "Lỗi bất định");
          return;
        }
      }

      let gameKey = this.createKeyForActionDict(action, sender.sessionId, targetClientId);
      if (targetClient) {
        targetClient.send("onP2pAction", {
          action: action,
          from: sender.sessionId,
          to: targetClientId,
          fromName: sender.userData?.username,
          gameKey: gameKey,
          amount: amount,
          currentGold: targetClient.userData.gold,
          userId: targetClient.userData.id
        });

        sender.send("onP2pActionSended", {
          action: action,
          to: targetClientId,
          from: sender.sessionId,
          toName: targetClient.userData?.username,
          amount: amount,
          currentGold: sender.userData?.gold,
          userId: sender.userData?.id
        });
      }
    });

    this.onMessage("p2pActionAccept", (sender, data) => {
      const { targetClientId, action } = data;
      const targetClient = this.clients.find(client => client.sessionId === targetClientId);
      let gameKey = this.createKeyForActionDict(action, targetClientId, sender.sessionId);

      this.minigameResultDict.set(gameKey, {
        from: targetClientId,
        to: sender.sessionId,
        result1: "",
        result2: ""
      })

      if (targetClient) {
        this.broadcast("onP2pActionAccept", {
          action: action,
          from: targetClientId,
          to: sender.sessionId,
          gameKey: gameKey
        });
      }
    });

    this.onMessage("p2pActionChoosed", (sender, data) => {
      const { senderAction, gameKey, action, from, to } = data;
      let fromPlayer = this.clients.find(client => client.sessionId === from);
      let toPlayer = this.clients.find(client => client.sessionId === to);

      if (this.minigameResultDict.has(gameKey)) {
        let result = this.minigameResultDict.get(gameKey);
        if (sender.sessionId == result.from) {
          result.result1 = senderAction;
        }
        else if (sender.sessionId == result.to) {
          result.result2 = senderAction;
        }

        if (result.result1 != "" && result.result2 != "") {
          let winner = this.getRPSWinner(result.from, result.to, result.result1, result.result2);

          if (action == ActionKey.RPS.toString() && winner != "draw" && fromPlayer?.userData?.id != toPlayer?.userData?.id) {
            if (fromPlayer?.userData) {
              fromPlayer.userData.gold = winner == fromPlayer.sessionId ? fromPlayer.userData.gold + RPS_FEE : fromPlayer.userData.gold - RPS_FEE;
              this.userRepository.update(fromPlayer.userData.id, { gold: fromPlayer.userData.gold });
            }
            if (toPlayer?.userData) {
              toPlayer.userData.gold = winner == toPlayer.sessionId ? toPlayer.userData.gold + RPS_FEE : toPlayer.userData.gold - RPS_FEE;
              this.userRepository.update(toPlayer.userData.id, { gold: toPlayer.userData.gold });
            }
          }

          this.broadcast("onP2pActionResult", {
            action: action + "Done",
            from: result.from,
            to: result.to,
            result1: result.result1,
            result2: result.result2,
            fee: RPS_FEE,
            winner: winner,
            fromGold: fromPlayer?.userData?.gold,
            toGold: toPlayer?.userData?.gold,
          });

          this.minigameResultDict.delete(gameKey);
        }
      }
      else {
        this.broadcast("onP2pGameError", {
          message: "Server Error",
          action: action,
          from: from,
          to: to
        })
      }
    });

    this.onMessage("p2pActionReject", (sender, data) => {
      const { targetClientId, action } = data;
      const targetClient = this.clients.find(client => client.sessionId === targetClientId);

      if (targetClient) {
        targetClient.send("onP2pActionReject", {
          action,
          from: sender.sessionId,  // Sending client ID
        });
      }
    });

    this.onMessage('useItem', (client, message) => {
      if (message.playerId != "") {
        for (const item of this.state.items) {
          if (item[1].ownerId == message.playerId)
            return;
        }
      }

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
    let userId = userData?.id ?? "";
    if (this.state.players.has(client.sessionId)) {
      this.resetMapItem(client, this.state.players.get(client.sessionId));
      this.state.players.delete(client.sessionId);
    }
    if (BaseGameRoom.globalTargetClients.has(userId)) {
      BaseGameRoom.globalTargetClients.delete(userId);
      this.broadcastToAllRooms('userTargetLeft', {
        userId: userData?.id,
        username: userData?.username,
        room: this.roomName,
      });
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
        this.broadcast('onUseItem', { itemId: item[0], playerId: '' });
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

    if (BaseGameRoom.eventData == null || BaseGameRoom.eventData.target_user == null) return;
    let targetUserId = BaseGameRoom.eventData.target_user.id;
    let userId = userData == null ? "0" : userData?.id;
    if (userId == targetUserId) {
      if (!BaseGameRoom.globalTargetClients.has(userId)) {
        BaseGameRoom.globalTargetClients.set(userId, client);
      }
      this.broadcastToAllRooms('userTargetJoined', {
      });
    }
    else {
      if (BaseGameRoom.globalTargetClients.has(targetUserId)) {
        client.send('userTargetJoined', {
        });
      }
    }
  }

  onDispose() {
    BaseGameRoom.activeRooms.delete(this);
  }
}
