import { Inject, Injectable } from '@nestjs/common';
import {
  AuthenticatedClient,
  FarmSlotState,
  PlantDataSchema,
  Player,
} from '@types';
import { BaseGameRoom } from './base-game.room';
import { FarmSlotService } from '@modules/farm-slots/farm-slots.service';
import { PlantCareUtils } from '@modules/plant/plant-care.service';
import {
  PlantOnSlotDto,
  SlotWithStatusDto,
} from '@modules/farm-slots/dto/farm-slot.dto';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Repository } from 'typeorm';
import { UserService } from '@modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ClanFundService } from '@modules/clan-fund/clan-fund.service';
import { CLanWarehouseService } from '@modules/clan-warehouse/clan-warehouse.service';
import { GameEventService } from '@modules/game-event/game-event.service';
import { MezonService } from '@modules/mezon/mezon.service';
import { PetPlayersService } from '@modules/pet-players/pet-players.service';
import { PlayerQuestService } from '@modules/player-quest/player-quest.service';
import { MessageTypes } from '../MessageTypes';
import { PlantState } from '@enum';
import { FARM_CONFIG } from '@constant/farm.constant';

@Injectable()
export class FarmRoom extends BaseGameRoom {
  private farmLoopInterval?: NodeJS.Timeout;
  private harvestTimers: Map<string, NodeJS.Timeout> = new Map();
  private interruptLocks = new Map<string, boolean>(); // khóa theo farm_slot_id
  private playerCount = 0;
  constructor(
    userRepository: Repository<UserEntity>,
    userService: UserService,
    jwtService: JwtService,
    mezonService: MezonService,
    gameEventService: GameEventService,
    petPlayersService: PetPlayersService,
    playerQuestService: PlayerQuestService,
    clanFundService: ClanFundService,
    cLanWarehouseService: CLanWarehouseService,
    @Inject() private readonly farmSlotsService: FarmSlotService,
  ) {
    super(
      userRepository,
      userService,
      jwtService,
      mezonService,
      gameEventService,
      petPlayersService,
      playerQuestService,
      clanFundService,
      cLanWarehouseService,
    );
  }

  override async onCreate(options: any) {
    super.onCreate(options);

    const farm = await this.farmSlotsService.getFarmWithSlotsByClan(
      this.roomName.split('-farm')[0],
    );
    farm.slots.forEach((slot) => {
      const slotState = new FarmSlotState();
      slotState.id = slot.id;
      slotState.slot_index = slot.slot_index;
      slotState.currentPlant =
        this.mapSlotEntityToPlantSchema(slot) || new PlantDataSchema();
      this.state.farmSlotState.set(slot.id, slotState);
    });

    this.onMessage('plantToSlot', async (client, dto: PlantOnSlotDto) => {
      try {
        const player = this.state.players.get(client.sessionId);
        const user = player
          ? await this.userRepository.findOne({ where: { id: player.user_id } })
          : null;

        if (!user) {
          throw new Error('User not found');
        }
        const userId = user.id;
        const result = await this.farmSlotsService.plantToSlot(userId, dto);
        const plant = result.currentPlant;
        if (!plant) {
          throw new Error('Plant data missing from DB result');
        }

        let slotState =
          this.state.farmSlotState.get(dto.farm_slot_id) || new FarmSlotState();
        slotState.currentPlant = Object.assign(new PlantDataSchema(), {
          id: plant.id,
          plant_id: plant.plant_id,
          plant_name: plant.plant_name,
          planted_by: plant.planted_by,
          grow_time: plant.grow_time,
          grow_time_remain: PlantCareUtils.calculateGrowRemain(
            plant.created_at,
            plant.grow_time,
          ),
          stage: PlantState.SEED,
          can_harvest: plant.can_harvest,
          need_water: plant.need_water,
          has_bug: plant.has_bug,
          harvest_at: null,
          created_at: plant.created_at.toISOString(),
          updated_at: plant.updated_at.toISOString(),
        });

        this.state.farmSlotState.set(dto.farm_slot_id, slotState);
        this.broadcast(MessageTypes.ON_SLOT_UPDATE, { slot: slotState });
      } catch (err) {
        this.logger.error(`[PlantToSlot] Error: ${err.message}`);
      }
    });

    this.onMessage(
      'waterPlant',
      async (client, payload: { farm_slot_id: string }) => {
        try {
          const player = this.state.players.get(client.sessionId);
          if (!player) throw new Error('Player not found in room');

          const user = await this.userRepository.findOne({
            where: { id: player.user_id },
          });
          if (!user) throw new Error('User not found');

          const slotBefore = await this.farmSlotsService.getSlotWithPlantById(
            payload.farm_slot_id,
          );

          if (!slotBefore || !slotBefore.currentPlant) return;

          const plantStage = PlantCareUtils.calculatePlantStage(
            slotBefore.currentPlant.created_at,
            slotBefore.currentPlant.grow_time,
          );
          const canHarvest = PlantCareUtils.checkCanHarvest(
            slotBefore.currentPlant.created_at,
            slotBefore.currentPlant.grow_time,
          );

          if (plantStage === PlantState.HARVESTABLE || canHarvest) {
            return;
          }

          const result = await this.farmSlotsService.waterPlant(
            user.id,
            payload.farm_slot_id,
          );

          const updatedSlot = await this.farmSlotsService.getSlotWithPlantById(
            payload.farm_slot_id,
          );

          if (!updatedSlot || !updatedSlot.currentPlant) return;

          const slotState =
            this.state.farmSlotState.get(updatedSlot.id) || new FarmSlotState();
          slotState.id = updatedSlot.id;
          slotState.slot_index = updatedSlot.slot_index;
          slotState.currentPlant = this.mapSlotEntityToPlantSchema(updatedSlot);
          if (slotState.currentPlant) slotState.currentPlant.need_water = false;
          this.state.farmSlotState.set(updatedSlot.id, slotState);
          this.broadcast(MessageTypes.ON_SLOT_UPDATE, { slot: slotState });
          client.send(MessageTypes.ON_WATER_PLANT, { message: result.message });
        } catch (err: any) {
          this.logger.error(`[WaterPlant] Error: ${err.message}`);
        }
      },
    );

    this.onMessage(
      'catchBug',
      async (client, payload: { farm_slot_id: string }) => {
        try {
          const player = this.state.players.get(client.sessionId);
          if (!player) throw new Error('Player not found in room');

          const user = await this.userRepository.findOne({
            where: { id: player.user_id },
          });
          if (!user) throw new Error('User not found');

          const slotBefore = await this.farmSlotsService.getSlotWithPlantById(
            payload.farm_slot_id,
          );
          if (!slotBefore || !slotBefore.currentPlant)
            throw new Error('No plant in this slot');

          const canHarvest = PlantCareUtils.checkCanHarvest(
            slotBefore.currentPlant.created_at,
            slotBefore.currentPlant.grow_time,
          );
          if (canHarvest) {
            return;
          }

          const result = await this.farmSlotsService.catchBug(
            user.id,
            payload.farm_slot_id,
          );

          const updatedSlot = await this.farmSlotsService.getSlotWithPlantById(
            payload.farm_slot_id,
          );
          if (!updatedSlot) return;

          const slotState =
            this.state.farmSlotState.get(updatedSlot.id) || new FarmSlotState();
          slotState.id = updatedSlot.id;
          slotState.slot_index = updatedSlot.slot_index;
          slotState.currentPlant = this.mapSlotEntityToPlantSchema(updatedSlot);
          if (slotState.currentPlant) slotState.currentPlant.has_bug = false;
          this.state.farmSlotState.set(updatedSlot.id, slotState);
          this.broadcast(MessageTypes.ON_SLOT_UPDATE, { slot: slotState });
          client.send(MessageTypes.ON_CATCH_BUG, { message: result.message });
        } catch (err: any) {
          this.logger.error(`[CatchBug] Error: ${err.message}`);
        }
      },
    );

    this.onMessage(
      'startHarvest',
      async (client, payload: { farm_slot_id: string }) => {
        const Player = this.state.players.get(client.sessionId);
        if (!Player) return;

        if (Player.isHarvesting) {
          client.send(MessageTypes.ON_HARVEST_DENIED, {
            sessionId: client.sessionId,
            message: 'Bạn đang thu hoạch, hãy đợi xong!',
          });
          return;
        }

        const slot = this.state.farmSlotState.get(payload.farm_slot_id);
        if (!slot?.currentPlant) {
          client.send(MessageTypes.ON_HARVEST_DENIED, {
            sessionId: client.sessionId,
            message: 'Không có cây ở ô này!',
          });
          return;
        }

        const userStat = await this.farmSlotsService.getUserHarvestStat(
          Player.user_id,
          Player.clan_id,
        );
        const remaining = userStat.max - userStat.used;
        if (remaining <= 0) {
          client.send(MessageTypes.ON_HARVEST_DENIED, {
            sessionId: client.sessionId,
            message: 'Bạn đã hết lượt thu hoạch!',
          });
          return;
        }

        if (!slot.currentPlant.can_harvest) {
          client.send(MessageTypes.ON_HARVEST_DENIED, {
            sessionId: client.sessionId,
            message: 'Cây chưa sẵn sàng thu hoạch!',
          });
          return;
        }

        if (slot.harvestingBy && slot.harvestingBy !== client.sessionId) {
          const otherPlayer = this.state.players.get(slot.harvestingBy);
          client.send(MessageTypes.ON_HARVEST_DENIED, {
            sessionId: client.sessionId,
            message: `Ô này đang được thu hoạch bởi ${otherPlayer?.display_name || 'người khác'}!`,
          });
          return;
        }

        slot.harvestingBy = client.sessionId;
        slot.harvestEndTime = Date.now() + FARM_CONFIG.HARVEST.DELAY_MS;

        const timer = setTimeout(async () => {
          Player.isHarvesting = true;
          await this.finishHarvest(slot.id, client.sessionId);
        }, FARM_CONFIG.HARVEST.DELAY_MS);
        this.harvestTimers.set(slot.id, timer);

        this.broadcast(MessageTypes.ON_HARVEST_STARTED, {
          slotId: slot.id,
          sessionId: client.sessionId,
          playerName: Player.display_name,
          endTime: slot.harvestEndTime,
        });
      },
    );

    this.onMessage('interruptHarvest', async (client, payload) => {
      const { fromPlayerId, farm_slot_id } = payload;
      const slot = this.state.farmSlotState.get(farm_slot_id);

      if (!slot) {
        client.send(MessageTypes.ON_HARVEST_INTERRUPTED_FAILED, {
          sessionId: client.sessionId,
          message: 'Ô ruộng không tồn tại!',
        });
        return;
      }

      if (this.interruptLocks.get(farm_slot_id)) {
        client.send(MessageTypes.ON_HARVEST_INTERRUPTED_FAILED, {
          sessionId: client.sessionId,
          message: 'Ô này đang bị phá thu hoạch bởi người khác!',
        });
        return;
      }

      if (!slot.harvestingBy) {
        client.send(MessageTypes.ON_HARVEST_INTERRUPTED_FAILED, {
          sessionId: client.sessionId,
          message: 'Không có ai đang thu hoạch ô này!',
        });
        return;
      }

      if (slot.harvestingBy === fromPlayerId) {
        client.send(MessageTypes.ON_HARVEST_INTERRUPTED_FAILED, {
          sessionId: client.sessionId,
          message: 'Không thể phá thu hoạch của chính mình!',
        });
        return;
      }

      const interrupter = this.state.players.get(fromPlayerId);
      const targetPlayer = this.state.players.get(slot.harvestingBy);

      if (!interrupter || !targetPlayer) {
        client.send(MessageTypes.ON_HARVEST_INTERRUPTED_FAILED, {
          sessionId: client.sessionId,
          message: 'Người chơi không tồn tại!',
        });
        return;
      }

      this.interruptLocks.set(farm_slot_id, true);

      try {
        if (slot.harvestingBy !== targetPlayer.id) {
          throw new Error('Slot đã bị ngắt thu hoạch trước đó!');
        }
        const result = await this.farmSlotsService.incrementHarvestInterrupted(
          interrupter.user_id,
          interrupter.clan_id,
          targetPlayer.user_id,
          targetPlayer.clan_id,
        );

        const plantInfo = await this.farmSlotsService.decreaseHarvestCount(
          slot.id,
        );

        clearTimeout(this.harvestTimers.get(slot.id));
        this.harvestTimers.delete(slot.id);

        slot.harvestingBy = '';
        slot.harvestEndTime = 0;
        targetPlayer.isHarvesting = false;

        client.send(MessageTypes.ON_HARVEST_INTERRUPTED, {
          sessionId: fromPlayerId,
          slotId: slot.id,
          interruptedPlayer: targetPlayer.id,
          interruptedPlayerName: targetPlayer.display_name || 'Ẩn Danh',
          selfHarvestInterrupt: result.interrupter,
        });

        const targetClient = this.getClientBySessionId(targetPlayer.id);
        if (targetClient) {
          targetClient.send(MessageTypes.ON_HARVEST_INTERRUPTED_BY_OTHER, {
            sessionId: slot.harvestingBy,
            slotId: slot.id,
            interruptedBy: fromPlayerId,
            interruptedByName: interrupter?.display_name || 'Ẩn Danh',
            selfHarvest: result.target,
            plantHarvest: plantInfo,
          });
        }
      } catch (err: any) {
        client.send(MessageTypes.ON_HARVEST_INTERRUPTED_FAILED, {
          sessionId: fromPlayerId,
          message: err.message || 'Phá thu hoạch thất bại!',
        });
      } finally {
        this.interruptLocks.delete(farm_slot_id);
      }
    });

    this.startFarmSlotLoop();
  }

  getClientBySessionId(sessionId: string) {
    return this.clients.find((c) => c.sessionId === sessionId) || null;
  }

  async onJoin(client: AuthenticatedClient, options: any, auth: any) {
    super.onJoin(client, options, auth);
    this.playerCount++;
    const { userData } = client;

    this.logger.log(
      `Player ${userData?.username} joined FarmRoom ${this.roomName}, id: ${this.roomId}`,
    );

    const player = new Player();
    player.id = client.sessionId;
    player.user_id = userData?.id ?? '';
    player.x = -1348;
    player.y = -345;
    player.is_show_name = BaseGameRoom.eventData == null;
    player.display_name = userData?.display_name || userData?.username || '';
    player.skin_set = userData?.skin_set?.join('/') || '';
    player.pet_players = JSON.stringify(
      userData?.pet_players
        ?.filter((a) => a.is_brought)
        .map((a) => ({
          id: a.id,
          name: a.name,
          species: a.pet?.species,
          rarity: a.pet?.rarity,
        })) ?? [],
    );
    player.isInBattle = false;
    player.clan_id = userData?.clan?.id ?? '';
    this.state.players.set(client.sessionId, player);
    this.logger.log(
      `Player ${userData?.username} has position ${player.x} ${player.y}`,
    );

    const slots = Array.from(this.state.farmSlotState.values()).map((slot) => {
      if (slot.currentPlant) {
        const createdAt = new Date(slot.currentPlant.created_at);
        const growTime = Number(slot.currentPlant.grow_time);

        if (!isNaN(createdAt.getTime()) && !isNaN(growTime)) {
          slot.currentPlant.grow_time_remain =
            PlantCareUtils.calculateGrowRemain(createdAt, growTime);
          slot.currentPlant.stage = PlantCareUtils.calculatePlantStage(
            createdAt,
            growTime,
          );
          slot.currentPlant.can_harvest = PlantCareUtils.checkCanHarvest(
            createdAt,
            growTime,
          );
        } else {
          slot.currentPlant.grow_time_remain = 0; // hoặc null
          slot.currentPlant.stage = PlantState.SEED;
          slot.currentPlant.can_harvest = false;
        }
      }
      return slot;
    });

    const messageData = {
      farm_id: this.roomName.split('-farm')[0],
      slots: slots,
    };
    client.send(MessageTypes.ON_SLOT_FARM, messageData);

    const harvestingSlots = Array.from(this.state.farmSlotState.values())
      .filter((slot) => slot.harvestingBy)
      .map((slot) => ({
        slotId: slot.id,
        sessionId: slot.harvestingBy!,
        playerName:
          this.state.players.get(slot.harvestingBy!)?.display_name || 'Ẩn Danh',
        endTime: slot.harvestEndTime,
      }));
    if (harvestingSlots.length > 0) {
      client.send(MessageTypes.ON_HARVEST_STARTED_ONJOIN, { slots: harvestingSlots });
    }
  }

  mapSlotEntityToPlantSchema(slot: SlotWithStatusDto): PlantDataSchema | null {
    if (!slot.currentPlant) {
      return null;
    }
    const p = slot.currentPlant;
    const schema = new PlantDataSchema();
    schema.id = p.id;
    schema.plant_id = p.plant_id;
    schema.plant_name = p.plant_name || '';
    schema.planted_by = p.planted_by;
    schema.grow_time = p.grow_time;
    schema.created_at = p.created_at.toISOString();
    schema.updated_at = p.updated_at.toISOString();

    schema.grow_time_remain = PlantCareUtils.calculateGrowRemain(
      p.created_at,
      p.grow_time,
    );
    schema.stage = PlantCareUtils.calculatePlantStage(
      p.created_at,
      p.grow_time,
    );
    schema.can_harvest = PlantCareUtils.checkCanHarvest(
      p.created_at,
      p.grow_time,
    );
    schema.need_water = PlantCareUtils.checkNeedWater(p) ?? false;
    schema.has_bug = PlantCareUtils.checkHasBug(p) ?? false;
    schema.harvest_at = p.harvest_at ? p.harvest_at.toISOString() : null;
    return schema;
  }

  override onLeave(client: AuthenticatedClient): void {
    this.playerCount--;
    this.state.players.delete(client.sessionId);
    if (this.playerCount <= 0) {
      this.stopFarmSlotLoop();
    }
  }

  override onDispose() {
    this.stopFarmSlotLoop();
    super.onDispose();
  }

  private startFarmSlotLoop() {
    if (this.farmLoopInterval) clearInterval(this.farmLoopInterval);

    this.farmLoopInterval = setInterval(async () => {
      try {
        const farmId = this.roomName.split('-farm')[0];
        const farm = await this.farmSlotsService.getFarmWithSlotsByClan(farmId);
        const changedSlots: FarmSlotState[] = [];

        for (const slot of farm.slots) {
          if (!slot.currentPlant) continue;

          const newStage = PlantCareUtils.calculatePlantStage(
            slot.currentPlant.created_at,
            slot.currentPlant.grow_time,
          );
          const newRemain = PlantCareUtils.calculateGrowRemain(
            slot.currentPlant.created_at,
            slot.currentPlant.grow_time,
          );
          const newCanHarvest = PlantCareUtils.checkCanHarvest(
            slot.currentPlant.created_at,
            slot.currentPlant.grow_time,
          );
          const newNeedWater = PlantCareUtils.checkNeedWater(slot.currentPlant);
          const newHasBug = PlantCareUtils.checkHasBug(slot.currentPlant);

          const currentSlotState = this.state.farmSlotState.get(slot.id);
          if (!currentSlotState || !currentSlotState.currentPlant) continue;

          const currentPlant = currentSlotState.currentPlant;

          if (
            currentPlant.stage !== newStage ||
            currentPlant.can_harvest !== newCanHarvest ||
            currentPlant.need_water !== newNeedWater ||
            currentPlant.has_bug !== newHasBug
          ) {
            currentPlant.stage = newStage;
            currentPlant.grow_time_remain = newRemain;
            currentPlant.can_harvest = newCanHarvest;
            currentPlant.need_water = newNeedWater;
            currentPlant.has_bug = newHasBug;

            this.state.farmSlotState.set(slot.id, currentSlotState);
            changedSlots.push(currentSlotState);
          }
        }

        if (changedSlots.length > 0) {
          this.broadcast(MessageTypes.ON_SLOT_UPDATE_RT, {
            slots: changedSlots,
          });
        }
      } catch (err) {
        this.logger.error(`[FarmLoop] Error: ${err.message}`);
      }
    }, 10000);
  }

  private stopFarmSlotLoop() {
    if (this.farmLoopInterval) {
      clearInterval(this.farmLoopInterval);
      this.farmLoopInterval = undefined;
    }
  }

  async finishHarvest(slotId: string, sessionId: string) {
    const Player = this.state.players.get(sessionId);
    if (!Player) return;

    const slot = this.state.farmSlotState.get(slotId);
    if (!slot || !slot.currentPlant) return;

    this.harvestTimers.delete(slotId);
    Player.isHarvesting = false;
    slot.harvestingBy = '';
    slot.harvestEndTime = 0;

    try {
      const result = await this.farmSlotsService.harvestPlant(
        Player.user_id,
        slotId,
      );
      const playerName = Player.display_name || 'Ẩn Danh';
      slot.currentPlant = null;
      this.state.farmSlotState.set(slotId, slot);

      this.broadcast(MessageTypes.ON_SLOT_UPDATE, { slot });
      this.broadcast(MessageTypes.ON_HARVEST_COMPLETE, {
        slotId,
        sessionId,
        playerName,
        remainingHarvest: result.remaining,
        maxHarvest: result.max,
      });
    } catch (err) {
      this.logger.error(`[finishHarvest] DB update failed: ${err.message}`);

      const client = this.getClientBySessionId(sessionId);
      if (client) {
        client.send(MessageTypes.ON_HARVEST_DENIED, {
          message: err.response?.message || 'Cây chưa sẵn sàng thu hoạch!',
          remaining: err.response?.remaining ?? null,
          max: err.response?.max ?? null,
        });
      }
    }
  }
}
