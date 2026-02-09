import { Inject, Injectable } from '@nestjs/common';
import { AuthenticatedClient, FarmSlotState, GuardPet, PlantDataSchema, Player } from '@types';
import { BaseGameRoom } from './base-game.room';
import { FarmSlotService } from '@modules/farm-slots/farm-slots.service';
import { PlantCareUtils } from '@modules/plant/plant-care.service';
import { PlantOnSlotDto, SlotWithStatusDto } from '@modules/farm-slots/dto/farm-slot.dto';
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
import { PetClanType, PlantState } from '@enum';
import { FARM_CONFIG } from '@constant/farm.constant';
import { GameConfigStore } from '@modules/admin/game-config/game-config.store';
import { GAME_CONFIG_KEYS } from '@constant/game-config.keys';
import { ClanAnimalsService } from '@modules/clan-animals/clan-animals.service';
import { ClanDecorInventoryService } from '@modules/clan-decor-invetory/clan-decor-inventory.service';
import { ClanEstateService } from '@modules/clan-estate/clan-estate.service';

@Injectable()
export class FarmRoom extends BaseGameRoom {
  private harvestTimers: Map<string, NodeJS.Timeout> = new Map();
  private interruptLocks = new Map<string, boolean>(); // khóa theo farm_slot_id
  private slotLocks = new Map<string, boolean>();
  private plantTimers = new Map<string, NodeJS.Timeout[]>();
  private guardPetLocks = new Map<string, boolean>(); // khóa theo pet_clan_id


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
    clanDecorInventoryService: ClanDecorInventoryService,
    clanAnimalService: ClanAnimalsService,
    clanEstateService: ClanEstateService,
    @Inject() private readonly farmSlotsService: FarmSlotService,
    private readonly configStore: GameConfigStore,
    @Inject() private readonly clanAnimalsService: ClanAnimalsService,
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
      clanDecorInventoryService,
      clanAnimalService,
      clanEstateService,
    );
  }

  private getFarmConfig(): typeof FARM_CONFIG {
    return (
      this.configStore.get<typeof FARM_CONFIG>(GAME_CONFIG_KEYS.FARM) ??
      FARM_CONFIG
    );
  }

  override async onCreate(options: any) {
    super.onCreate(options);

    const farm = await this.farmSlotsService.getFarmWithSlotsByClan(
      this.roomName.split('-farm')[0],
    );

    const pets = await this.clanAnimalsService.getListClanAnimalsByClanId({
      clan_id: this.roomName.split('-farm')[0],
      is_active: true,
    });

    pets.forEach((pet) => {
      const guardPet = new GuardPet();
      guardPet.id = pet.id;
      guardPet.name = pet.pet_clan.name;
      guardPet.petClanId = pet.pet_clan_id;
      guardPet.petCLanCode = pet.pet_clan.pet_clan_code;
      guardPet.slotIndex = Number(pet.slot_index ?? 0);
      guardPet.isActive = true;
      this.state.guardPets.set(guardPet.id, guardPet);
    });

    farm.slots.forEach((slot) => {
      const slotState = new FarmSlotState();
      slotState.id = slot.id;
      slotState.slot_index = slot.slot_index;
      slotState.currentPlant =
        this.mapSlotEntityToPlantSchema(slot) || new PlantDataSchema();
      this.state.farmSlotState.set(slot.id, slotState);
      if (slotState.currentPlant) {
        this.schedulePlant(slot.id, slotState.currentPlant);
      }
    });

    this.onMessage('plantToSlot', async (client, dto: PlantOnSlotDto) => {
      const slotId = dto.farm_slot_id;

      if (this.slotLocks.get(slotId)) {
        client.send(MessageTypes.ON_PLANT_TO_PLANT_FAILED, {
          sessionId: client.sessionId,
          message: 'Ô này đang được trồng bởi người khác!',
        });
        return;
      }
      this.slotLocks.set(slotId, true);
      try {
        const player = this.state.players.get(client.sessionId);
        const user = player
          ? await this.userRepository.findOne({ where: { id: player.user_id } })
          : null;

        if (!user) throw new Error('User not found');

        const result = await this.farmSlotsService.plantToSlot(user.id, dto);
        const plant = result.currentPlant;
        if (!plant) throw new Error('Plant data missing');

        const slotState =
          this.state.farmSlotState.get(slotId) || new FarmSlotState();
        const newPlant = new PlantDataSchema();
        newPlant.id = plant.id;
        newPlant.plant_id = plant.plant_id;
        newPlant.plant_name = plant.plant_name || '';
        newPlant.planted_by = plant.planted_by;
        newPlant.grow_time = plant.grow_time;
        newPlant.grow_time_remain = PlantCareUtils.calculateGrowRemain(
          plant.created_at,
          plant.grow_time,
        );
        newPlant.stage = PlantState.SEED;
        newPlant.can_harvest = plant.can_harvest;
        newPlant.need_water = plant.need_water;
        newPlant.has_bug = plant.has_bug;
        newPlant.harvest_at = null;
        newPlant.created_at = plant.created_at.toISOString();
        newPlant.updated_at = plant.updated_at.toISOString();
        slotState.currentPlant = newPlant;
        const newSlotState = new FarmSlotState();
        newSlotState.id = slotState.id;
        newSlotState.slot_index = slotState.slot_index;
        newSlotState.harvestingBy = slotState.harvestingBy;
        newSlotState.harvestEndTime = slotState.harvestEndTime;
        newSlotState.currentPlant = newPlant;
        newSlotState.harvest_count = slotState.harvest_count;
        this.state.farmSlotState.set(slotId, newSlotState);
        this.schedulePlant(slotId, newPlant);
      } catch (err: any) {
        this.logger.error(`[PlantToSlot] Error: ${err.message}`);
        client.send(MessageTypes.ON_PLANT_TO_PLANT_FAILED, {
          message:
            'Vật phẩm đã được sử dụng hết hoặc đang được người khác dùng. Vui lòng thử lại sau.',
        });
      } finally {
        this.slotLocks.delete(slotId);
      }
    });

    this.onMessage('waterPlant', async (client, payload: { farm_slot_id: string }) => {
      if (!client.sessionId || !payload.farm_slot_id) return;
      const slotId = payload.farm_slot_id;
      if (this.slotLocks.get(slotId)) {
        client.send(MessageTypes.ON_WATER_PLANT_FAILED, {
          sessionId: client.sessionId,
          message: 'Ô này đang được tưới nước bởi người khác!',
        });
        return;
      }

      this.slotLocks.set(slotId, true);
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
          slotBefore.currentPlant.harvest_count,
          this.getFarmConfig(),
        );

        if (plantStage === PlantState.HARVESTABLE || canHarvest) {
          return;
        }

        const result = await this.farmSlotsService.waterPlant(
          user.id,
          slotId,
        );
        const updatedSlot =
          await this.farmSlotsService.getSlotWithPlantById(slotId);
        if (!updatedSlot || !updatedSlot.currentPlant) return;

        const slotState =
          this.state.farmSlotState.get(updatedSlot.id) || new FarmSlotState();
        const newSlotState = new FarmSlotState();
        Object.assign(newSlotState, slotState);

        if (!slotState.currentPlant) return;
        const newPlant = new PlantDataSchema();
        Object.assign(newPlant, slotState.currentPlant);
        newPlant.need_water = false;
        newPlant.stage = slotState.currentPlant.stage;
        newPlant.has_bug = slotState.currentPlant.has_bug;
        newPlant.can_harvest = slotState.currentPlant.can_harvest;
        newPlant.grow_time_remain = PlantCareUtils.calculateGrowRemain(
          new Date(slotState.currentPlant.created_at),
          slotState.currentPlant.grow_time,
        );

        newSlotState.currentPlant = newPlant;
        this.state.farmSlotState.set(updatedSlot.id, newSlotState);
        client.send(MessageTypes.ON_WATER_PLANT, {
          slotId,
          sessionId: client.sessionId,
          message: result.message,
        });
      } catch (err: any) {
        this.logger.error(`[WaterPlant] Error: ${err.message}`);
      } finally {
        this.slotLocks.delete(slotId);
      }
    },
    );

    this.onMessage('catchBug', async (client, payload: { farm_slot_id: string }) => {
      if (!client.sessionId || !payload.farm_slot_id) return;
      const slotId = payload.farm_slot_id;
      if (this.slotLocks.get(slotId)) {
        client.send(MessageTypes.ON_CATCH_BUG_FAILED, {
          sessionId: client.sessionId,
          message: 'Ô này đang được bắt bọ bởi người khác!',
        });
        return;
      }

      this.slotLocks.set(slotId, true);
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
          slotBefore.currentPlant.harvest_count,
          this.getFarmConfig(),
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
        const newSlotState = new FarmSlotState();
        Object.assign(newSlotState, slotState);

        if (!slotState.currentPlant) return;
        const newPlant = new PlantDataSchema();
        Object.assign(newPlant, slotState.currentPlant);
        newPlant.need_water = slotState.currentPlant.need_water;
        newPlant.stage = slotState.currentPlant.stage;
        newPlant.has_bug = false;
        newPlant.can_harvest = slotState.currentPlant.can_harvest;
        newPlant.grow_time_remain = PlantCareUtils.calculateGrowRemain(
          new Date(slotState.currentPlant.created_at),
          slotState.currentPlant.grow_time,
        );

        newSlotState.currentPlant = newPlant;
        this.state.farmSlotState.set(updatedSlot.id, newSlotState);

        client.send(MessageTypes.ON_CATCH_BUG, {
          slotId: payload.farm_slot_id,
          sessionId: client.sessionId,
          message: result.message,
        });
      } catch (err: any) {
        this.logger.error(`[CatchBug] Error: ${err.message}`);
      } finally {
        this.slotLocks.delete(slotId);
      }
    },
    );

    this.onMessage('startHarvest', async (client, payload: { farm_slot_id: string, harvest_tool_id?: string }) => {
      if (!client.sessionId || !payload.farm_slot_id) return;
      const Player = this.state.players.get(client.sessionId);
      if (!Player) return;
      try {
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
        const farmConfigs = this.getFarmConfig();
        if (farmConfigs.HARVEST.ENABLE_LIMIT && userStat.remaining <= 0) {
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

        const clanId = await this.farmSlotsService.getClanByFarmSlot(payload.farm_slot_id);

        if (Player.clan_id !== clanId) {
          const allActivePets = await this.clanAnimalsService.getListClanAnimalsByClanId({
            clan_id: clanId,
            is_active: true,
          });

          let totalDogRate = 0;

          for (const pet of allActivePets) {
            if (pet.pet_clan.type !== PetClanType.DOG) continue;

            const petRateRes = await this.clanAnimalsService.getPetRate(pet.id);
            totalDogRate += petRateRes.totalRate;
          }

          if (totalDogRate > 0) {
            const roll = Math.random() * 100;
            if (roll < totalDogRate) {
              client.send(MessageTypes.ON_DOG_BITE, {
                sessionId: client.sessionId,
                message: 'Bạn bị chó canh nông trại phát hiện! Thu hoạch thất bại',
              });
              return;
            }
          }
        }

        if (slot.harvestingBy && slot.harvestingBy !== client.sessionId) {
          const otherPlayer = this.state.players.get(slot.harvestingBy);
          client.send(MessageTypes.ON_HARVEST_DENIED, {
            sessionId: client.sessionId,
            message: `Ô này đang được thu hoạch bởi ${otherPlayer?.display_name || 'người khác'}!`,
          });
          return;
        }
        const farmConfig = this.getFarmConfig();

        let reductionRate = 0;
        if (payload.harvest_tool_id) {
          reductionRate = await this.farmSlotsService.getToolRate(payload.harvest_tool_id)

          await this.farmSlotsService.decreaseToolQuantityInClanWarehouse(Player.clan_id, payload.harvest_tool_id);
        }

        const baseDelayMs = farmConfig.HARVEST.DELAY_MS;
        const finalDelayMs = Math.floor(baseDelayMs * (1 - reductionRate));

        slot.harvestingBy = client.sessionId;
        slot.harvestEndTime = Date.now() + finalDelayMs;

        Player.isHarvesting = true;
        const timer = setTimeout(async () => {
          await this.finishHarvest(slot.id, client.sessionId);
        }, finalDelayMs);
        this.harvestTimers.set(slot.id, timer);
        this.broadcast(MessageTypes.ON_HARVEST_STARTED, {
          slotId: slot.id,
          sessionId: client.sessionId,
          playerName: Player.display_name,
          endTime: slot.harvestEndTime,
        });
      } catch (err: any) {
        client.send(MessageTypes.ON_HARVEST_DENIED, {
          sessionId: client.sessionId,
          message:
            'Vật phẩm đã được sử dụng hết hoặc đang được người khác dùng. Vui lòng thử lại sau.',
        });
      }
    });

    this.onMessage('interruptHarvest', async (client, payload) => {
      const { fromPlayerId, farm_slot_id, interrupt_tool_id } = payload;
      if (!client.sessionId || !payload.farm_slot_id || !payload.fromPlayerId)
        return;
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

        const chance = Math.random(); // 0 → 1
        const farmConfig = this.getFarmConfig();

        let increaseRate = 0;
        if (interrupt_tool_id) {
          increaseRate = await this.farmSlotsService.getToolRate(interrupt_tool_id);

          await this.farmSlotsService.decreaseToolQuantityInClanWarehouse(interrupter.clan_id, interrupt_tool_id);
        }

        const successRate = Math.min(farmConfig.HARVEST.INTERRUPT_RATE + increaseRate, 1);

        if (chance > successRate) {
          client.send(MessageTypes.ON_HARVEST_INTERRUPTED_FAILED, {
            sessionId: fromPlayerId,
            message: 'Phá thu hoạch thất bại!',
          });
          return;
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
        const slotState =
          this.state.farmSlotState.get(slot.id) || new FarmSlotState();
        const newSlotState = new FarmSlotState();
        Object.assign(newSlotState, slotState);

        if (!slotState.currentPlant) return;
        newSlotState.harvest_count += 1;

        if (farmConfig.PLANT.ENABLE_LIMIT && newSlotState.harvest_count >= farmConfig.PLANT.MAX_HARVEST) {
          this.harvestTimers.delete(slot.id);
          this.resetPlant(slot.id);
          this.broadcast(MessageTypes.ON_PLANT_DEATH, {
            harverstId: slot.harvestingBy,
            interruptedId: fromPlayerId,
            message: 'Cây đã bị phá hoàn toàn sau hết lượt thu hoạch!',
          });
        } else {
          this.state.farmSlotState.set(slot.id, newSlotState);
        }

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

    this.onMessage('UpdateSlots', async (client) => {
      const slots = Array.from(this.state.farmSlotState.values()).map(
        (slot) => {
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
                slot.harvest_count,
                this.getFarmConfig(),
              );
            } else {
              slot.currentPlant.grow_time_remain = 0;
              slot.currentPlant.stage = PlantState.SEED;
              slot.currentPlant.can_harvest = false;
            }
          }
          return slot;
        },
      );

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
            this.state.players.get(slot.harvestingBy!)?.display_name ||
            'Ẩn Danh',
          endTime: slot.harvestEndTime,
        }));
      if (harvestingSlots.length > 0) {
        client.send(MessageTypes.ON_HARVEST_PLAYER_JOIN, {
          slots: harvestingSlots,
        });
      }
    });

    this.onMessage('decreaseGrowthTime', async (client, payload: { farm_slot_id: string; growth_plant_tool_id: string }) => {
      if (!client.sessionId || !payload.farm_slot_id) return;

      const { farm_slot_id, growth_plant_tool_id } = payload;
      if (this.slotLocks.get(farm_slot_id)) {
        client.send(MessageTypes.ON_DECREASE_GROWTH_TIME_FAILED, {
          sessionId: client.sessionId,
          message: 'Ô này đang được sử dụng!',
        });
        return;
      }

      this.slotLocks.set(farm_slot_id, true);
      try {
        const player = this.state.players.get(client.sessionId);
        if (!player) throw new Error('Player not found in room');

        const user = await this.userRepository.findOne({
          where: { id: player.user_id },
        });
        if (!user) throw new Error('User not found');

        const slotClanid = await this.farmSlotsService.getClanByFarmSlot(farm_slot_id);

        if (player.clan_id !== slotClanid) {
          client.send(MessageTypes.ON_DECREASE_GROWTH_TIME_FAILED, {
            message:
              'Bạn không thuộc clan sở hữu nông trại này.',
          });
        }

        const slotBefore = await this.farmSlotsService.getSlotWithPlantById(
          payload.farm_slot_id,
        );
        if (!slotBefore || !slotBefore.currentPlant)
          throw new Error('No plant in this slot');

        const canHarvest = PlantCareUtils.checkCanHarvest(
          slotBefore.currentPlant.created_at,
          slotBefore.currentPlant.grow_time,
          slotBefore.currentPlant.harvest_count,
          this.getFarmConfig(),
        );
        if (canHarvest) {
          return;
        }

        const result =
          await this.farmSlotsService.decreasePlantGrowTime(
            player.clan_id,
            farm_slot_id,
            growth_plant_tool_id,
          );

        const updatedSlot = await this.farmSlotsService.getSlotWithPlantById(
          payload.farm_slot_id,
        );
        if (!updatedSlot) return;

        const slotState =
          this.state.farmSlotState.get(updatedSlot.id) || new FarmSlotState();

        const newPlant = this.mapSlotEntityToPlantSchema(updatedSlot);
        if (!newPlant) return;

        const newSlotState = new FarmSlotState();
        Object.assign(newSlotState, slotState);
        newSlotState.currentPlant = newPlant;

        this.state.farmSlotState.set(updatedSlot.id, newSlotState);
        this.schedulePlant(updatedSlot.id, newPlant);

        this.broadcast(MessageTypes.ON_DECREASE_GROWTH_TIME, {
          slotId: updatedSlot.id,
          sessionId: client.sessionId,
          typeTool: result.typeTool,
          message: result.message,
          growTimeRemain: result.newGrowTimeRemain,
          stage: result.updatedPlantStage,
        });
      } catch (err: any) {
        this.logger.error(`[GrowthPlantToolUse] Error: ${err.message}`);
        client.send(MessageTypes.ON_DECREASE_GROWTH_TIME_FAILED, {
          message:
            'Vật phẩm đã được sử dụng hết hoặc đang được người khác dùng. Vui lòng thử lại sau.',
        });
      } finally {
        this.slotLocks.delete(farm_slot_id);
      }
    });

    this.onMessage('activateGuardPet', async (client, payload) => {
      if (!client.sessionId) return;
      const lockKey = payload.id; // pet_id

      if (this.guardPetLocks.get(lockKey)) {
        client.send(MessageTypes.ON_ACTIVATE_PET_FAILED, {
          message: 'Pet đang được người khác thao tác, vui lòng thử lại!',
        });
        return;
      }

      this.guardPetLocks.set(lockKey, true);
      try {
        const pet = await this.clanAnimalsService.activateClanAnimal(
          payload.clan_id,
          payload.id,
        );
        let guardPet = this.state.guardPets.get(pet.id);
        guardPet = new GuardPet();
        guardPet.id = pet.id;
        guardPet.petClanId = pet.pet_clan_id;
        guardPet.name = pet.pet_clan.name;
        guardPet.petCLanCode = pet.pet_clan.pet_clan_code;
        guardPet.slotIndex = pet.slot_index!;
        guardPet.isActive = true;
        this.state.guardPets.set(guardPet.id, guardPet);
      } catch (err: any) {
        client.send(MessageTypes.ON_ACTIVATE_PET_FAILED, {
          message: `Không thể đưa pet ra nông trại có thể đã đạt tối đa pet ở nông trại!!`,
        });
      } finally {
        this.guardPetLocks.delete(lockKey);
      }
    });

    this.onMessage('deactivateGuardPet', async (client, payload) => {
      if (!client.sessionId) return;
      const lockKey = payload.id;
      if (this.guardPetLocks.get(lockKey)) {
        client.send(MessageTypes.ON_DEACTIVATE_PET_FAILED, {
          message: 'Pet đang được người khác thao tác!',
        });
        return;
      }

      this.guardPetLocks.set(lockKey, true);
        try {
          const pet = await this.clanAnimalsService.deactivateClanAnimal(
            payload.clan_id,
            payload.id,
          );
          let guardPet = this.state.guardPets.get(pet.id);
          if (guardPet) {
            guardPet = new GuardPet();
            guardPet.id = pet.id;
            guardPet.petClanId = pet.pet_clan_id;
            guardPet.isActive = false;
            this.state.guardPets.set(guardPet.id, guardPet);
          }
        } catch (err: any) {
            client.send(MessageTypes.ON_DEACTIVATE_PET_FAILED, {
              message: `Không thể đưa pet về chuồng!!`,
            });
        }finally {
          this.guardPetLocks.delete(lockKey);
        }
    });
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
          rarity: a?.current_rarity,
        })) ?? [],
    );
    player.totalPetBattle = userData?.pet_players?.filter(pet => pet?.battle_slot > 0)?.length ?? 0;
    player.isInBattle = false;
    player.isHarvesting = false;
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
            slot.harvest_count,
            this.getFarmConfig(),
          );
        } else {
          slot.currentPlant.grow_time_remain = 0;
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
      client.send(MessageTypes.ON_HARVEST_PLAYER_JOIN, {
        slots: harvestingSlots,
      });
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
      p.harvest_count,
      this.getFarmConfig(),
    );
    schema.need_water = PlantCareUtils.checkNeedWater(p, this.getFarmConfig()) ?? false;
    schema.has_bug = PlantCareUtils.checkHasBug(p, this.getFarmConfig()) ?? false;
    schema.harvest_at = p.harvest_at ? p.harvest_at.toISOString() : null;
    return schema;
  }

  override onLeave(client: AuthenticatedClient): void {
    this.playerCount--;
    const sessionId = client.sessionId;
    const player = this.state.players.get(sessionId);
    if (player) {
      if (player.isHarvesting) {
        const slot = Array.from(this.state.farmSlotState.values()).find(
          (s) => s.harvestingBy === sessionId,
        );

        if (slot) {
          const timer = this.harvestTimers.get(slot.id);
          if (timer) {
            clearTimeout(timer);
          }
          this.harvestTimers.delete(slot.id);
          slot.harvestingBy = '';
          slot.harvestEndTime = 0;
          this.broadcast(MessageTypes.ON_CANCEL_HARVEST_PLAYER_LEFT, {
            slotId: slot.id,
          });
        }
      }
    }

    if (this.playerCount <= 0) {
      this.clearAllGuardPets();
    }
    this.state.players.delete(sessionId);
  }

  private clearAllGuardPets() {
    this.state.guardPets.clear();
  }

  override onDispose() {
    super.onDispose();
  }

  async finishHarvest(slotId: string, sessionId: string) {
    const Player = this.state.players.get(sessionId);
    if (!Player) return;

    const slot = this.state.farmSlotState.get(slotId);
    if (!slot || !slot.currentPlant || slot.harvestingBy !== sessionId) return;

    this.harvestTimers.delete(slotId);
    Player.isHarvesting = false;
    try {
      const result = await this.farmSlotsService.harvestPlant(
        Player.user_id,
        slotId,
      );
      const playerName = Player.display_name || 'Ẩn Danh';
      this.resetPlant(slot.id);
      this.broadcast(MessageTypes.ON_HARVEST_COMPLETE, {
        slotId,
        sessionId,
        playerName,
        baseScore: result.baseScore,
        careBonus: result.careBonus,
        clanMultiplier: result.clanMultiplier,
        finalScore: result.finalScore,
        finalPlayerScore: result.finalPlayerScore,
        finalGold: result.finalGold,
        bonusPercent: result.bonusPercent,
        catRateBonus: result.catRateBonus,
        catGoldBonus: result.catGoldBonus,
        birdRateBonus: result.birdRateBonus,
        birdScoreBonus: result.birdScoreBonus,
        remainingHarvest: result.remaining,
        maxHarvest: result.max,
      });
    } catch (err) {
      this.logger.error(`[finishHarvest] DB update failed: ${err.message}`);
      const client = this.getClientBySessionId(sessionId);
      if (client) {
        client.send(MessageTypes.ON_HARVEST_DENIED, {
          message: err.response?.message || 'Cây chưa sẵn sàng thu hoạch!',
          slotId,
          remaining: err.response?.remaining ?? null,
          max: err.response?.max ?? null,
        });
      }
    }
  }

  private schedulePlant(slotId: string, plant: PlantDataSchema) {
    if (this.plantTimers.has(slotId)) {
      this.plantTimers.get(slotId)?.forEach(clearTimeout);
      this.plantTimers.delete(slotId);
    }

    const timers: NodeJS.Timeout[] = [];
    const now = Date.now();
    const plantCreated = new Date(plant.created_at).getTime();
    const growTime = Number(plant.grow_time);
    if (isNaN(growTime)) return;

    const { totalWater, totalBug } =
      PlantCareUtils.calculateCareNeeds(growTime);
    const waterInterval = PlantCareUtils.getNextCareInterval(
      growTime,
      totalWater,
    );
    const bugInterval = PlantCareUtils.getNextCareInterval(growTime, totalBug);

    // Water timers
    for (let i = 0; i < totalWater; i++) {
      const waterTime = plantCreated + (i + 1) * waterInterval * 1000;
      const delay = waterTime - now;
      if (delay <= 0) continue;
      timers.push(
        setTimeout(
          () => this.updatePlantState(slotId, { need_water: true }),
          delay,
        ),
      );
    }

    // Bug timers
    for (let i = 0; i < totalBug; i++) {
      const bugTime = plantCreated + (i + 1) * bugInterval * 1000;
      const delay = bugTime - now;
      if (delay <= 0) continue;
      timers.push(
        setTimeout(
          () => this.updatePlantState(slotId, { has_bug: true }),
          delay,
        ),
      );
    }

    // Stage timers
    const stageIntervals = [
      { ratio: 0.3, stage: PlantState.SMALL },
      { ratio: 0.8, stage: PlantState.GROWING },
      { ratio: 1, stage: PlantState.HARVESTABLE },
    ];
    stageIntervals.forEach(({ ratio, stage }) => {
      const stageTime = plantCreated + growTime * ratio * 1000;
      const delay = stageTime - now;
      if (delay <= 0) return;
      timers.push(
        setTimeout(() => {
          const extra: Partial<PlantDataSchema> = { stage };
          if (stage === PlantState.HARVESTABLE) extra.can_harvest = true;
          this.updatePlantState(slotId, extra);
        }, delay),
      );
    });

    this.plantTimers.set(slotId, timers);
  }

  private updatePlantState(slotId: string, patch: Partial<PlantDataSchema>) {
    const slotState = this.state.farmSlotState.get(slotId);
    if (!slotState?.currentPlant) return;

    const newSlotState = new FarmSlotState();
    newSlotState.id = slotState.id;
    newSlotState.slot_index = slotState.slot_index;
    newSlotState.harvest_count = slotState.harvest_count;
    newSlotState.harvestingBy = slotState.harvestingBy;
    newSlotState.harvestEndTime = slotState.harvestEndTime;

    const newPlant = new PlantDataSchema();
    Object.assign(newPlant, slotState.currentPlant, patch);

    newPlant.grow_time_remain = PlantCareUtils.calculateGrowRemain(
      new Date(newPlant.created_at),
      newPlant.grow_time,
    );

    newSlotState.currentPlant = newPlant;
    this.state.farmSlotState.set(slotId, newSlotState);
    // this.logger
    //   .log(`[DEBUG] change state Slot ${slotId} setting has_bug = ${newPlant.has_bug},
    //  need_water = ${newPlant.need_water}, can_harvest = ${newPlant.can_harvest}, grow_time_remain = ${newPlant.grow_time_remain}`);
  }

  resetPlant(slotId: string) {
    const slot = this.state.farmSlotState.get(slotId);
    if (!slot) return;

    slot.currentPlant = null;

    const newSlotState = new FarmSlotState();
    Object.assign(newSlotState, slot);

    newSlotState.currentPlant = null;
    newSlotState.harvestingBy = '';
    newSlotState.harvestEndTime = 0;
    this.state.farmSlotState.set(slotId, newSlotState);
  }
}
