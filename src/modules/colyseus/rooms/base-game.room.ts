import { MapSchema, Schema, type } from '@colyseus/schema';
import { configEnv } from '@config/env.config';
import { BATTLE_MAX_FEE, BATTLE_MIN_FEE, EXCHANGERATE, RPS_FEE, SYSTEM_ERROR } from '@constant';
import { ActionKey, MapKey, QuestType } from '@enum';
import { Logger } from '@libs/logger';
import { JwtPayload } from '@modules/auth/dtos/response';
import { GameEventService } from '@modules/game-event/game-event.service';
import { MezonService } from '@modules/mezon/mezon.service';
import { PetPlayersService } from '@modules/pet-players/pet-players.service';
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
import { AuthenticatedClient, Player, PlayerBattleInfo, WithdrawMezonPayload } from '@types';
import { Client, matchMaker, Room } from 'colyseus';
import { IncomingMessage } from 'http';
import { Repository } from 'typeorm';
import { Door } from '../door/Door';
import { DoorManager } from '../door/DoorManager';
import { Pet } from '../pet/Pet';
import { PetQueueManager } from '../pet/PetQueueManager';
import { RoomManager } from '../rooms/global-room';
import { UserService } from '@modules/user/user.service';
import { UserWithPetPlayers } from '@modules/user/dto/user.dto';
import { plainToInstance } from 'class-transformer';
import { MessageTypes } from '../MessageTypes';
import { PlayerSessionManager } from '../player/PlayerSessionManager';
import { QuestEventEmitter } from '@modules/player-quest/events/quest.events';
import { PlayerQuestService } from '@modules/player-quest/player-quest.service';

export class Item extends Schema {
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('string') type: string = '';
  @type('string') ownerId: string = '';

  constructor(
    x: number = 0,
    y: number = 0,
    type: string = '',
    ownerId: string = '',
  ) {
    super();
    this.x = x;
    this.y = y;
    this.type = type;
    this.ownerId = ownerId;
  }
}

export class RoomState extends Schema {
  @type({ map: Player }) players = new Map<string, Player>();
  @type({ map: Item }) items = new Map<string, Item>();
  @type({ map: Pet }) pets = new Map<string, Pet>();
  @type({ map: Door }) doors = new MapSchema<Door>();
  @type({ map: PlayerBattleInfo }) battlePlayers = new MapSchema<PlayerBattleInfo>();
}

@Injectable()
export class BaseGameRoom extends Room<RoomState> {
  private minigameResultDict = new Map();
  private playersInBattle = new Set<string>();
  // maxClients = 50; // Max players
  logger = new Logger();
  petQueueManager: PetQueueManager;
  private pethangeRoomInterval: any;
  protected doorManager: DoorManager;
  speciesPetEvent = 'DragonIce';
  static activeRooms: Set<BaseGameRoom> = new Set();
  static globalTargetClients: Map<string, Client> = new Map();
  static eventData: any;
  constructor(
    @InjectRepository(UserEntity)
    readonly userRepository: Repository<UserEntity>,
    @Inject() private readonly userService: UserService,
    @Inject() private readonly jwtService: JwtService,
    @Inject() private readonly mezonService: MezonService,
    @Inject() private readonly gameEventService: GameEventService,
    @Inject() readonly petPlayersService: PetPlayersService,
    @Inject() readonly playerQuestService: PlayerQuestService,
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

    if (!user) {
      throw new NotFoundException('User not found or not assigned to any map');
    }

    const petPlayers = await this.petPlayersService.findPetPlayersWithPet({
      user: { id: user.id },
    });

    const userWithPets: UserWithPetPlayers = plainToInstance(
      UserWithPetPlayers,
      {
        ...user,
        pet_players: petPlayers,
      },
    );

    console.log(`User ${user.username} is allowed in ${this.roomId}`);
    client.userData = userWithPets;
    PlayerSessionManager.register(client.userData.id, client);
    if (client?.userData?.id) {
      await this.playerQuestService.initQuest(client.userData.id, { timezone : 'Asia/Ho_Chi_Minh' });
      QuestEventEmitter.emitProgress(client.userData.id, QuestType.NEWBIE_LOGIN);
      QuestEventEmitter.emitProgress(client.userData.id, QuestType.LOGIN_DAYS, 1);
    }
    return true;
  }

  broadcastToAllRooms(type: string, data: any) {
    BaseGameRoom.activeRooms.forEach((room) => {
      room.broadcast(type, data);
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
    return gameType + '-' + p1 + '-' + p2;
  }

  sendMessageToTarget(client: Client, action, message) {
    client.send('noticeMessage', { action: action, message: message });
  }

  getRPSWinner(p1, p2, result1, result2) {
    if (result1 === result2) {
      return 'draw';
    }

    const winsAgainst = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper',
    };

    if (winsAgainst[result1] === result2) {
      return p1;
    } else {
      return p2;
    }
  }

  async onCreate(options: any) {
    this.setState(new RoomState());
    BaseGameRoom.activeRooms.add(this);
    RoomManager.addRoom(this);
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

    this.onMessage('globalChat', (client, buffer) => {
      this.broadcastToAllRooms('onGlobalChat', buffer);
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
        sessionId: client.sessionId,
      });
    });

    this.onMessage('onPlayerUpdateGold', (client, data) => {
      const { newValue, amountChange, needUpdate } = data;
      if (client?.userData?.gold != null) {
        if (newValue >= 0) {
          client.userData.gold = newValue;
        } else {
          return;
        }

        if (needUpdate && client?.userData) {
          this.userRepository.update(client.userData.id, { gold: newValue });
        }

        let responseData = {
          sessionId: client.sessionId,
          amountChange: amountChange,
        };
        this.broadcast('onPlayerUpdateGold', responseData);
      }
    });
    this.onMessage('onPlayerUpdateDiamond', (client, data) => {
      const { newValue, amountChange, needUpdate } = data;
      if (client?.userData?.diamond != null) {
        if (newValue >= 0) {
          client.userData.diamond = newValue;
        } else {
          return;
        }

        if (needUpdate && client?.userData) {
          this.userRepository.update(client.userData.id, { diamond: newValue });
        }

        const responseData = {
          sessionId: client.sessionId,
          amountChange: amountChange,
        };
        this.broadcast('onPlayerUpdateDiamond', responseData);
      }
    });

    this.onMessage(
      'onWithrawDiamond',
      async (client: AuthenticatedClient, data: WithdrawMezonPayload) => {
        const user = client.userData;

        if (!user?.id) {
          return client.send('onWithdrawFailed', {
            reason: 'Không xác định được người dùng',
          });
        }

        const result = await this.mezonService.withdrawTokenRequest(
          data,
          user.id,
        );

        if (!result.success) {
          return client.send('onWithdrawFailed', {
            reason: result.message ?? SYSTEM_ERROR,
          });
        }

        const responseData = {
          sessionId: client.sessionId,
          amountChange: data.amount,
        };

        this.broadcast('onWithrawDiamond', responseData);
      },
    );

    this.onMessage(
      'onExchangeDiamondToCoin',
      async (client: AuthenticatedClient, data) => {
        const { diamondTransfer } = data;
        const userId = client.userData?.id;

        if (!userId) {
          return client.send('onExchangeFailed', {
            reason: 'Không xác định được người dùng',
          });
        }

        const user = await this.userRepository.findOne({
          where: { id: userId },
        });

        if (!user) {
          return client.send('onExchangeFailed', {
            reason: 'Không tìm thấy thông tin người dùng',
          });
        }

        if (user.diamond < diamondTransfer) {
          return client.send('onExchangeFailed', {
            reason: 'Không đủ diamond để quy đổi',
          });
        }

        const coinToAdd = Math.floor(diamondTransfer / EXCHANGERATE);
        if (coinToAdd <= 0) {
          return client.send('onExchangeFailed', {
            reason: 'Không đủ diamond để quy đổi',
          });
        }

        const newGold = user.gold + coinToAdd;
        const newDiamond = user.diamond - diamondTransfer;
        const responseData = {
          sessionId: client.sessionId,
          coinChange: coinToAdd,
          diamondChange: -diamondTransfer,
        };
        this.broadcast('onExchangeDiamondToCoin', responseData);
        try {
          await this.userRepository.update(userId, {
            gold: newGold,
            diamond: newDiamond,
          });
        } catch (err) {
          return client.send('onExchangeFailed', {
            reason: 'Lỗi hệ thống khi cập nhật dữ liệu. Vui lòng thử lại.',
          });
        }
      },
    );

    this.onMessage('p2pAction', (sender, data) => {
      const { targetClientId, action, amount } = data;

      if (
        action == ActionKey.RPS.toString() &&
        sender.userData?.diamond < RPS_FEE
      ) {
        this.sendMessageToTarget(sender, action, 'Không đủ tiền');
        return;
      }

      const targetClient = this.clients.find(
        (client) => client.sessionId === targetClientId,
      );
      for (let key of this.minigameResultDict.keys()) {
        if (key.includes(sender.sessionId) || targetClient?.userData == null) {
          this.sendMessageToTarget(
            sender,
            action,
            'Không thể mời người chơi này',
          );
          return;
        }
      }

      if (targetClient && action == ActionKey.RPS.toString() && targetClient.userData.diamond < RPS_FEE
      ) {
        this.sendMessageToTarget(sender, action, 'Người chơi không đủ tiền');
        return;
      }

      if (action == ActionKey.SendCoin.toString()) {
        if (
          amount <= 0 ||
          sender.userData?.diamond <= 0 ||
          sender.userData?.diamond < amount
        ) {
          this.sendMessageToTarget(sender, action, 'Không đủ tiền');
          return;
        }

        if (
          sender.userData &&
          targetClient?.userData &&
          sender.userData.id != targetClient?.userData.id
        ) {
          sender.userData.diamond -= amount;
          targetClient.userData.diamond += amount;

          this.userRepository.update(sender.userData.id, {
            diamond: sender.userData.diamond,
          });
          this.userRepository.update(targetClient.userData.id, {
            diamond: targetClient.userData.diamond,
          });
        } else {
          this.sendMessageToTarget(sender, action, 'Lỗi bất định');
          return;
        }
      }

      if (action == ActionKey.Battle.toString()) {
        if (sender.userData?.id == targetClient?.userData?.id) {
          this.sendMessageToTarget(sender, action, 'Cùng 1 tài khoản không thể thách đấu');
          return;
        }
        if (amount <= 0) {
          this.sendMessageToTarget(sender, action, 'Số tiền thách đấu không hợp lệ');
          return;
        }
        if (sender.userData?.diamond <= 0 || sender.userData?.diamond < amount) {
          this.sendMessageToTarget(sender, action, 'Bạn không đủ tiền');
          return;
        }

        if (amount < BATTLE_MIN_FEE || amount > BATTLE_MAX_FEE) {
          this.sendMessageToTarget(sender, action, 'Số tiền thách đấu không hợp lệ');
          return;
        }

        if (targetClient?.userData.diamond < amount) {
          this.sendMessageToTarget(sender, action, 'Người chơi không đủ tiền');
          return;
        }
      }

      let gameKey = this.createKeyForActionDict(
        action,
        sender.sessionId,
        targetClientId,
      );
      if (targetClient) {
        targetClient.send('onP2pAction', {
          action: action,
          from: sender.sessionId,
          to: targetClientId,
          fromName: sender.userData?.display_name,
          gameKey: gameKey,
          amount: amount,
          currentDiamond: targetClient.userData.diamond,
          userId: targetClient.userData.id,
        });

        sender.send('onP2pActionSended', {
          action: action,
          to: targetClientId,
          from: sender.sessionId,
          toName: targetClient.userData?.display_name,
          amount: amount,
          currentDiamond: sender.userData?.diamond,
          userId: sender.userData?.id,
        });
      }
    });

    this.onMessage('p2pActionAccept', (sender, data) => {
      const { targetClientId, action } = data;
      const targetClient = this.clients.find(
        (client) => client.sessionId === targetClientId,
      );
      let gameKey = this.createKeyForActionDict(
        action,
        targetClientId,
        sender.sessionId,
      );

      this.minigameResultDict.set(gameKey, {
        from: targetClientId,
        to: sender.sessionId,
        result1: '',
        result2: '',
      });

      if (targetClient) {
        this.broadcast('onP2pActionAccept', {
          action: action,
          from: targetClientId,
          to: sender.sessionId,
          gameKey: gameKey,
        });
      }
    });

    this.onMessage('p2pActionChoosed', (sender, data) => {
      const { senderAction, gameKey, action, from, to } = data;
      let fromPlayer = this.clients.find((client) => client.sessionId === from);
      let toPlayer = this.clients.find((client) => client.sessionId === to);

      if (this.minigameResultDict.has(gameKey)) {
        let result = this.minigameResultDict.get(gameKey);
        if (sender.sessionId == result.from) {
          result.result1 = senderAction;
        } else if (sender.sessionId == result.to) {
          result.result2 = senderAction;
        }

        if (result.result1 != '' && result.result2 != '') {
          let winner = this.getRPSWinner(
            result.from,
            result.to,
            result.result1,
            result.result2,
          );

          if (
            action == ActionKey.RPS.toString() &&
            winner != 'draw' &&
            fromPlayer?.userData?.id != toPlayer?.userData?.id
          ) {
            if (fromPlayer?.userData) {
              fromPlayer.userData.diamond =
                winner == fromPlayer.sessionId
                  ? fromPlayer.userData.diamond + RPS_FEE
                  : fromPlayer.userData.diamond - RPS_FEE;
              this.userRepository.update(fromPlayer.userData.id, {
                diamond: fromPlayer.userData.diamond,
              });
            }
            if (toPlayer?.userData) {
              toPlayer.userData.diamond =
                winner == toPlayer.sessionId
                  ? toPlayer.userData.diamond + RPS_FEE
                  : toPlayer.userData.diamond - RPS_FEE;
              this.userRepository.update(toPlayer.userData.id, {
                diamond: toPlayer.userData.diamond,
              });
            }
          }

          this.broadcast('onP2pActionResult', {
            action: action + 'Done',
            from: result.from,
            to: result.to,
            result1: result.result1,
            result2: result.result2,
            fee: RPS_FEE,
            winner: winner,
            fromDiamond: fromPlayer?.userData?.diamond,
            toDiamond: toPlayer?.userData?.diamond,
          });
          QuestEventEmitter.emitProgress(fromPlayer?.userData?.id, QuestType.PLAY_RPS, 1);
          QuestEventEmitter.emitProgress(toPlayer?.userData?.id, QuestType.PLAY_RPS, 1);
          this.minigameResultDict.delete(gameKey);
        }
      } else {
        this.broadcast('onP2pGameError', {
          message: 'Server Error',
          action: action,
          from: from,
          to: to,
        });
      }
    });

    this.onMessage('p2pActionReject', (sender, data) => {
      const { targetClientId, action } = data;
      const targetClient = this.clients.find(
        (client) => client.sessionId === targetClientId,
      );

      if (targetClient) {
        targetClient.send('onP2pActionReject', {
          action,
          from: sender.sessionId, // Sending client ID
        });
      }
    });

    this.onMessage('useItem', (client, message) => {
      if (message.playerId != '') {
        for (const item of this.state.items) {
          if (item[1].ownerId == message.playerId) return;
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
    this.onMessage('catchPet', async (client: AuthenticatedClient, message) => {
      if (client.userData == null) return;
      this.petQueueManager.handleCatchRequest(
        client,
        message,
        this.removePet.bind(this),
      );
      QuestEventEmitter.emitProgress(client.userData.id, QuestType.CATCH_PETS, 1);
    });
    this.onMessage('sendPetFollowPlayer', async (client, data) => {
      const { pets } = data;
      if (!Array.isArray(pets)) return;
      const targetPlayerState = Array.from(this.state.players.values()).find(
        (player) => player.id === client.sessionId
      );
      if (!targetPlayerState) return;
      try {
        const player = this.clients.getById(client.sessionId);
        if (player == null) return;
        const result = await this.petPlayersService.findPetPlayersByUserId(player.userData.id);
        if (result == null) return;

        const newPetData = JSON.stringify(result.filter(a => a.is_brought).map(a => ({
          id: a.id,
          name: a.name,
          species: a.pet?.species,
          rarity: a.pet?.rarity,
        })));

        if (targetPlayerState.pet_players !== newPetData) {
          targetPlayerState.pet_players = newPetData;
        }

        const broadcastData = {
          playerIdFollowPet: client.sessionId,
          pet: pets,
        };
        this.broadcast('onPetFollowPlayer', broadcastData);
      } catch (err) {
        console.error(`[sendPetFollowPlayer] Failed to update DB`, err);
      }
    });
    this.petQueueManager = new PetQueueManager(
      this,
      async (playerId, petId, foodId) => {
        const client = this.clients.find((c) => c.sessionId === playerId);
        if (!client) return false;
        return await this.petPlayersService.catchPetPlayers(
          petId,
          client.userData,
          foodId,
        );
      },
    );
    this.onMessage('sendTouchPet', async (client, data) => {
      const {
        touchPlayerId,
        targetPetId,
        lengthCompliment,
        lengthProvokeLine,
      } = data;
      const handler = async () => {
        if (this.clients.length <= 0) return;
        const isOwnerTouching = client.sessionId === touchPlayerId;
        const index = isOwnerTouching
          ? Math.floor(Math.random() * lengthCompliment)
          : Math.floor(Math.random() * lengthProvokeLine);
        // Gửi kết quả xuống client
        this.broadcast('onSendTouchPet', {
          targetPetId,
          playerTouchingPetId: isOwnerTouching
            ? client.sessionId
            : touchPlayerId,
          isOwnerTouching,
          randomIndex: index,
        });
      };
      this.petQueueManager.addPetTouch(targetPetId, handler);
    });
    this.onMessage(MessageTypes.END_BATTLE, (sender, data) => {
      const playerEnd = this.state.players.get(sender.sessionId);
      this.playersInBattle.delete(sender.sessionId);
      if (playerEnd == null) return;
      playerEnd.isInBattle = false;
      this.broadcast(MessageTypes.END_BATTLE_COMPLETED, {
        playerUpdateStatusBattle: sender.sessionId,
      });
    });
    this.spawnPetInRoom();

    //combat
    this.onMessage('p2pCombatActionAccept', (sender, data) => {
      const { targetClientId, action, amount } = data;
      if (action !== ActionKey.Battle.toString()) {
        this.sendMessageToTarget(sender, action, 'Lỗi bất định');
        return;
      }

      const targetClient = this.clients.find(c => c.sessionId === targetClientId);
      if (!targetClient) {
        this.sendMessageToTarget(sender, action, 'Lỗi bất định');
        return;
      }

      const player1Id = sender.sessionId;
      const player2Id = targetClient.sessionId;

      const notifyIfInBattle = (id: string, recipient: any) => {
        if (this.playersInBattle.has(id)) {
          recipient?.send(MessageTypes.NOTIFY_BATTLE, { message: "Đối thủ đang trong trận rồi" });
          return true;
        }
        return false;
      };

      // Check nếu sender hoặc target đang bận
      if (notifyIfInBattle(player1Id, targetClient)) return;
      if (notifyIfInBattle(player2Id, sender)) return;

      // Đánh dấu & tạo phòng
      [player1Id, player2Id].forEach(id => {
        const player = this.state.players.get(id);
        if (player) {
          player.isInBattle = true;
          this.playersInBattle.add(id);
        }
      });

      this.createBattleRoom(player1Id, player2Id, amount);
    });

    this.onMessage(MessageTypes.NOT_PET_BATTLE, async (client: AuthenticatedClient, data) => {
      const { sender } = data
      const player = this.clients.getById(sender);
      if (player == null) return;
      player.send(MessageTypes.NOTIFY_BATTLE, { message: "Đối thủ chưa có Pet để chiến đấu" })
    });

    this.onMessage(MessageTypes.NOT_ENOUGH_PET_BATTLE, async (client: AuthenticatedClient, data) => {
      const { sender } = data
      const player = this.clients.getById(sender);
      if (player == null) return;
      player.send(MessageTypes.NOTIFY_BATTLE, { message: "Đối thủ chưa có đủ Pet để chiến đấu" })

    });
    this.onMessage(MessageTypes.NOT_ENOUGH_SKILL_PET_BATTLE, async (client: AuthenticatedClient, data) => {
      const { sender } = data
      const player = this.clients.getById(sender);
      if (player == null) return;
      player.send(MessageTypes.NOTIFY_BATTLE, { message: "Đối thủ chưa thiết lập kỹ năng Pet đầy đủ" })

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

  onLeave(client: AuthenticatedClient) {
    const { userData } = client;
    let userId = userData?.id ?? '';
    this.playersInBattle.delete(client.sessionId);
    if (this.state.players.has(client.sessionId)) {
      this.resetMapItem(client, this.state.players.get(client.sessionId));
      this.state.players.delete(client.sessionId);
    }
    if (BaseGameRoom.globalTargetClients.has(userId)) {
      BaseGameRoom.globalTargetClients.delete(userId);
      this.broadcastToAllRooms('userTargetLeft', {
        userId: userData?.id,
        username: userData?.display_name,
        room: this.roomName,
      });
    }
    this.logger.log(
      `Player ${userData?.display_name} left room ${this.roomName}`,
    );
  }

  resetMapItem(client: AuthenticatedClient, player: Player | undefined) {
    for (const item of this.state.items) {
      if (client.sessionId == item[1].ownerId) {
        item[1].ownerId = '';
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

  async onJoin(client: AuthenticatedClient, options: any, auth: any) {
    const { userData } = client;
    if (!BaseGameRoom.eventData) {
      BaseGameRoom.eventData =
        await this.gameEventService.findOneCurrentEvent();
    }
    if (
      BaseGameRoom.eventData == null ||
      BaseGameRoom.eventData.target_user == null
    )
      return;
    let targetUserId = BaseGameRoom.eventData.target_user.id;
    let userId = userData == null ? '0' : userData?.id;
    if (userId == targetUserId) {
      if (!BaseGameRoom.globalTargetClients.has(userId)) {
        BaseGameRoom.globalTargetClients.set(userId, client);
      }
      this.broadcastToAllRooms('userTargetJoined', {});
    } else {
      if (BaseGameRoom.globalTargetClients.has(targetUserId)) {
        client.send('userTargetJoined', {});
      }
    }
  }

  onDispose() {
    BaseGameRoom.activeRooms.delete(this);
    RoomManager.removeRoom(this);
    this.state.pets.clear();
    if (this.pethangeRoomInterval) clearInterval(this.pethangeRoomInterval);
  }

  //Pet
  async handlePetAsync(): Promise<void> {
    const pets = await this.petPlayersService.getAvailablePetPlayersWithRoom(
      this.roomName,
    );
    const petSpawns = pets.filter(
      (pet) => pet.pet.species === this.speciesPetEvent,
    );
    if (!petSpawns || petSpawns.length === 0) {
      return;
    }
    petSpawns.forEach((petData) => {
      const pet = new Pet();
      pet.SetDataPet(petData, this.roomName);
      this.state.pets.set(petData.id, pet);
    });
  }

  async changePetRoom(): Promise<void> {
    if (this.state.pets.size > 0) {
      for (const pet of this.state.pets.values()) {
        if (pet == null || pet.species != this.speciesPetEvent) continue;
        const roomCode = this.getRandomMapKey(pet.roomCode);
        this.removePet(pet.id);
        let pets = await this.petPlayersService.updatePetPlayers(
          { map: roomCode },
          pet.id,
        );
        if (!pets) return;
        this.clients.forEach((client) => {
          client.send('onPetDisappear', {
            petId: pet.id,
          });
        });
      }
    }
  }

  private getRandomMapKey(currentKey: string): MapKey {
    const values = Object.values(MapKey).filter(
      (k) => k !== (currentKey as MapKey),
    );
    const randomIndex = Math.floor(Math.random() * values.length);
    return values[randomIndex];
  }

  broadcastPetPositions(pet: Pet) {
    const petData = {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      position: { x: pet.position.x, y: pet.position.y },
      angle: pet.angle,
      moving: pet.moving,
    };
    this.broadcast('petPositionUpdate', petData);
  }

  removePet(petId: string) {
    this.state.pets.delete(petId);
  }
  spawnPetInRoom() {
    this.handlePetAsync().then(() => {
      if (this.state.pets.size === 0) {
        return;
      }
      this.setSimulationInterval(() => {
        // Trường hợp không chỉ định ID: duyệt tất cả pet
        for (const pet of this.state.pets.values()) {
          pet.updateMovement();
          this.broadcastPetPositions(pet);
        }
      }, 100);
    });
  }
  async createBattleRoom(player1Id: string, player2Id: string, valueChallenge: number) {
    try {
      const room = await matchMaker.createRoom("battle-room", {
        roomName: this.roomName,
        amount: valueChallenge
      });
      // Gửi thông báo cho client
      this.broadcast(MessageTypes.BATTE_ROOM_READY, {
        roomId: room.roomId,
        player1Id,
        player2Id
      });

    } catch (error) {
      // Cập nhật trạng thái battle cho cả hai
      [player1Id, player2Id].forEach(id => {
        const player = this.state.players.get(id);
        if (player) player.isInBattle = false;
        const client = this.clients.getById(id);
        if (client != null) {
          client.send(MessageTypes.NOTIFY_BATTLE, { message: "Có lỗi xảy ra" })
        }
      });

    }

  }
}
