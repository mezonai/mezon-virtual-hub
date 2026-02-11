import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FarmSlotEntity } from './entity/farm-slots.entity';
import { SlotsPlantEntity } from '@modules/slots-plant/entity/slots-plant.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  FarmWithSlotsDto,
  PlantOnSlotDto,
  SlotWithStatusDto,
} from './dto/farm-slot.dto';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { FarmEntity } from '@modules/farm/entity/farm.entity';
import { ClanWarehouseEntity } from '@modules/clan-warehouse/entity/clan-warehouse.entity';
import { PlantCareUtils } from '@modules/plant/plant-care.service';
import { CLanWarehouseService } from '@modules/clan-warehouse/clan-warehouse.service';
import { ClanActivityActionType, ClanFundType, PetClanType, PlantState } from '@enum';
import { CLAN_WAREHOUSE, FARM_CONFIG, TOOL_RATE_MAP } from '@constant/farm.constant';
import { UserClanStatEntity as UserClanStatEntity } from '@modules/user-clan-stat/entity/user-clan-stat.entity';
import { UserClanStatService } from '@modules/user-clan-stat/user-clan-stat.service';
import { ClanActivityService } from '@modules/clan-activity/clan-activity.service';
import { ClanFundService } from '@modules/clan-fund/clan-fund.service';
import { GameConfigStore } from '@modules/admin/game-config/game-config.store';
import { GAME_CONFIG_KEYS } from '@constant/game-config.keys';
import { ClanAnimalsService } from '@modules/clan-animals/clan-animals.service';

@Injectable()
export class FarmSlotService {
  constructor(
    @InjectRepository(FarmSlotEntity)
    private readonly farmSlotRepo: Repository<FarmSlotEntity>,
    @InjectRepository(SlotsPlantEntity)
    private readonly slotPlantRepo: Repository<SlotsPlantEntity>,
    @InjectRepository(PlantEntity)
    private readonly plantRepo: Repository<PlantEntity>,
    @InjectRepository(ClanWarehouseEntity)
    private readonly clanWarehouseRepo: Repository<ClanWarehouseEntity>,
    private readonly clanWarehouseService: CLanWarehouseService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(FarmEntity)
    private readonly farmRepo: Repository<FarmEntity>,
    @InjectRepository(UserClanStatEntity)
    private readonly userClanStatRepo: Repository<UserClanStatEntity>,
    private readonly userClanStatService: UserClanStatService,
    private readonly clanActivityService: ClanActivityService,
    private readonly clanFundService: ClanFundService,
    private readonly configStore: GameConfigStore,
    private readonly clanAnimalsService: ClanAnimalsService,
  ) {}

  private getFarmConfig(): typeof FARM_CONFIG {
    return (
      this.configStore.get<typeof FARM_CONFIG>(GAME_CONFIG_KEYS.FARM) ??
      FARM_CONFIG
    );
  }

  async getFarmWithSlotsByClan(clan_id: string): Promise<FarmWithSlotsDto> {
    if (!clan_id) throw new NotFoundException('clan_id is required');

    const farm = await this.farmRepo.findOne({
      where: { clan_id },
      relations: [
        'slots',
        'slots.currentSlotPlant',
        'slots.currentSlotPlant.plant',
      ],
    });

    if (!farm)
      throw new NotFoundException(`Farm for clan_id ${clan_id} not found`);
    farm.slots.sort((a, b) => a.slot_index - b.slot_index);
    const slotsWithStatus = await this.mapSlotsWithStatus(farm.slots);

    return {
      farm_id: farm.id,
      slots: slotsWithStatus,
    };
  }

  async getFarmWithSlotsByFarm(farm_id: string): Promise<FarmWithSlotsDto> {
    if (!farm_id) throw new NotFoundException('farm_id is required');

    const farm = await this.farmRepo.findOne({
      where: { id: farm_id },
      relations: [
        'slots',
        'slots.currentSlotPlant',
        'slots.currentSlotPlant.plant',
      ],
    });

    if (!farm) throw new NotFoundException(`Farm with id ${farm_id} not found`);

    farm.slots.sort((a, b) => a.slot_index - b.slot_index);
    const slotsWithStatus = await this.mapSlotsWithStatus(farm.slots);

    return {
      farm_id: farm.id,
      slots: slotsWithStatus,
    };
  }

  async getClanByFarmSlot(farm_slot_id: string) {
    const slot = await this.farmSlotRepo.findOne({
      where: { id: farm_slot_id },
      relations: ['farm'],
    });

    if (!slot) {
      throw new NotFoundException('Farm slot not found');
    }

    return slot.farm.clan_id;
  }

  private async mapSlotsWithStatus(
    slots: FarmSlotEntity[],
  ): Promise<SlotWithStatusDto[]> {
    const slotDtos = await Promise.all(
      slots.map(async (slot) => {
        const p = slot.currentSlotPlant;
        if (!p) {
          return {
            id: slot.id,
            slot_index: slot.slot_index,
            currentPlant: null,
          };
        }

        const isDead = await this.checkPlantDeath(slot, p);
        if (isDead) {
          return {
            id: slot.id,
            slot_index: slot.slot_index,
            currentPlant: null,
          };
        }

        const stage = PlantCareUtils.calculatePlantStage(
          p.created_at,
          p.grow_time,
        );
        const growRemain = PlantCareUtils.calculateGrowRemain(
          p.created_at,
          p.grow_time,
        );
        const { nextWaterTime, needWaterUpdated } =
          PlantCareUtils.getNextWaterTime(p);
        const { nextBugTime, hasBugUpdated } = PlantCareUtils.getNextBugTime(p);
        const totalNeed = PlantCareUtils.calculateCareNeeds(p.grow_time);
        const farmConfig = this.getFarmConfig();
        const canHarvest = PlantCareUtils.checkCanHarvest(
          p.created_at,
          p.grow_time,
          p.harvest_count,
          farmConfig,
        );
        const needWater =
          !canHarvest &&
          new Date() >= (nextWaterTime ?? new Date(0)) &&
          p.total_water_count < totalNeed.totalWater;
        const hasBug =
          !canHarvest &&
          new Date() >= (nextBugTime ?? new Date(0)) &&
          p.total_bug_caught < totalNeed.totalBug;

        let shouldSave =
          needWaterUpdated ||
          hasBugUpdated ||
          p.need_water_until?.getTime() !== nextWaterTime?.getTime() ||
          p.bug_until?.getTime() !== nextBugTime?.getTime() ||
          p.stage !== stage;
        if (shouldSave) {
          p.stage = stage;
          p.need_water_until = nextWaterTime ?? null;
          p.bug_until = nextBugTime ?? null;
        }
        if (canHarvest) {
          p.need_water_until = null;
          p.bug_until = null;
        }
        await this.slotPlantRepo.save(p);

        return {
          id: slot.id,
          slot_index: slot.slot_index,
          currentPlant: {
            ...p,
            plant_name: p.plant?.name || '',
            stage,
            growRemain,
            needWater,
            hasBug,
            canHarvest,
          },
        };
      }),
    );

    return slotDtos;
  }

  async checkPlantDeath(
    slot: FarmSlotEntity,
    plant: SlotsPlantEntity,
  ): Promise<boolean> {
    const farmConfig = this.getFarmConfig();

    const now = new Date();
    const deathAt = new Date(
      plant.created_at.getTime() + farmConfig.PLANT.DEATH_MS,
    );

    const isExpiredByTime = now >= deathAt;

    const isExpiredByHarvest =
      farmConfig.PLANT.ENABLE_LIMIT &&
      (plant.harvest_count ?? 0) >= farmConfig.PLANT.MAX_HARVEST;

    if (isExpiredByTime || isExpiredByHarvest) {
      slot.current_slot_plant_id = null;
      await this.farmSlotRepo.save(slot);
      await this.slotPlantRepo.softRemove(plant);
      return true;
    }

    return false;
  }

  async plantToSlot(userId: string, dto: PlantOnSlotDto) {
    const slot = await this.farmSlotRepo.findOne({
      where: { id: dto.farm_slot_id },
      relations: ['farm'],
    });
    if (!slot) throw new NotFoundException('Farm slot not found');

    // Nếu slot đã có cây sống, throw
    if (slot.current_slot_plant_id) {
      const existingPlant = await this.slotPlantRepo.findOne({
        where: { id: slot.current_slot_plant_id },
        withDeleted: true,
      });

      if (existingPlant && !existingPlant.deleted_at) {
        throw new BadRequestException('Slot already has a planted crop');
      } else {
        slot.current_slot_plant_id = null;
        await this.farmSlotRepo.save(slot);
      }
    }

    const plant = await this.plantRepo.findOne({ where: { id: dto.plant_id } });
    if (!plant) throw new NotFoundException('Plant not found');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (!slot.farm.clan_id)
      throw new BadRequestException('This farm is not assigned to any clan');
    if (!user.clan_id || user.clan_id !== slot.farm.clan_id)
      throw new BadRequestException('You are not a member of this clan');

    await this.clanWarehouseService.updateClanWarehousePlant(
      slot.farm.clan_id,
      plant.id,
      CLAN_WAREHOUSE.QUANTITY.USE_ONE_SEED,
      { autoCreate: false, isHarvested: CLAN_WAREHOUSE.ITEM_TYPE.SEED },
    );

    const now = new Date();
    const care = PlantCareUtils.calculateCareNeeds(plant.grow_time);

    // Tính interval cho bug và water
    const initialBugInterval = PlantCareUtils.getNextCareInterval(
      plant.grow_time,
      care.totalBug,
    );
    const initialWaterInterval = PlantCareUtils.getNextCareInterval(
      plant.grow_time,
      care.totalWater,
    );

    // Tạo slotPlant mới
    const slotPlant = this.slotPlantRepo.create({
      farm_slot_id: slot.id,
      plant_id: plant.id,
      plant_name: plant.name as string,
      planted_by: user.id,
      grow_time: plant.grow_time,
      harvest_at: null,
      expected_water_count: care.totalWater,
      expected_bug_count: care.totalBug,
      total_bug_caught: 0,
      total_water_count: 0,
      created_at: now,
      updated_at: now,
      bug_until: new Date(now.getTime() + initialBugInterval * 1000),
      need_water_until: new Date(now.getTime() + initialWaterInterval * 1000),
    });

    const saved = await this.slotPlantRepo.save(slotPlant);

    slot.current_slot_plant_id = saved.id;
    await this.farmSlotRepo.save(slot);
    const need_water = slotPlant.need_water_until
      ? slotPlant.need_water_until <= new Date()
      : false;

    const has_bug = slotPlant.bug_until
      ? slotPlant.bug_until <= new Date()
      : false;

    return {
      message: 'Planted successfully!',
      currentPlant: {
        id: saved.id,
        plant_id: plant.id,
        plant_name: plant.name,
        planted_by: user.id,
        grow_time: plant.grow_time,
        grow_time_remain: plant.grow_time,
        stage: PlantState.SEED,
        can_harvest: false,
        need_water: need_water,
        has_bug: has_bug,
        created_at: now,
        updated_at: now,
      },
    };
  }

  async getToolRate(toolId?: string) {
    if (!toolId) return 0;

    const tool = await this.clanWarehouseRepo.findOne({
      where: { item_id: toolId },
    });

    if (!tool) {
      throw new NotFoundException('Tool not found');
    }

    const rate = TOOL_RATE_MAP[tool.type];

    if (rate === undefined) {
      throw new BadRequestException('Item is not a supported tool');
    }

    return rate;
  }

  async decreaseToolQuantityInClanWarehouse(clanId: string, toolId: string) {
    const tool = await this.clanWarehouseRepo.findOne({
      where: { clan_id: clanId, item_id: toolId },
    });

    if (!tool) throw new NotFoundException('Tool not found');

    if (tool.quantity <= 0) throw new BadRequestException('Tool quantity is insufficient');

    tool.quantity -= 1;
    if (tool.quantity <= 0) {
      await this.clanWarehouseRepo.remove(tool);
    } else {
      await this.clanWarehouseRepo.save(tool);
    }

    return tool;
  }

  async decreasePlantGrowTime(clanId: string, farmSlotId: string, toolId: string) {
    const slot = await this.farmSlotRepo.findOne({
      where: { id: farmSlotId },
      relations: ['currentSlotPlant'],
    });
    if (!slot?.currentSlotPlant) throw new NotFoundException('No plant on this slot');

    const plant = slot.currentSlotPlant;

    const growRemain = PlantCareUtils.calculateGrowRemain(new Date(plant.created_at), plant.grow_time);
    const reductionRate = await this.getToolRate(toolId);
    const deltaMs = growRemain * reductionRate * 1000;

    plant.created_at = new Date(plant.created_at.getTime() - deltaMs);

    const { totalWater, totalBug } = PlantCareUtils.calculateCareNeeds(plant.grow_time);

    const autoWater = Math.ceil(totalWater * reductionRate);
    const autoBug = Math.ceil(totalBug * reductionRate);

    plant.total_water_count = Math.min(
      totalWater,
      plant.total_water_count + autoWater,
    );

    plant.total_bug_caught = Math.min(
      totalBug,
      plant.total_bug_caught + autoBug,
    );

    const { nextWaterTime } = PlantCareUtils.getNextWaterTime(plant);
    const { nextBugTime } = PlantCareUtils.getNextBugTime(plant);

    plant.need_water_until = nextWaterTime ?? null;
    plant.bug_until = nextBugTime ?? null;

    await this.slotPlantRepo.save(plant);

    const tool = await this.decreaseToolQuantityInClanWarehouse(clanId, toolId);

    return {
      message: `Plant grow time reduced by ${reductionRate * 100}%`,
      typeTool: tool.type,
      newGrowTimeRemain: PlantCareUtils.calculateGrowRemain(new Date(plant.created_at), plant.grow_time),
      updatedPlantStage: PlantCareUtils.calculatePlantStage(new Date(plant.created_at), plant.grow_time),
    };
  }

  async waterPlant(userId: string, farmSlotId: string) {
    const slot = await this.farmSlotRepo.findOne({
      where: { id: farmSlotId },
      relations: ['currentSlotPlant'],
    });

    if (!slot) {
      throw new NotFoundException(`Farm slot ${farmSlotId} not found`);
    }

    if (!slot.currentSlotPlant) {
      throw new NotFoundException(`No plant found on slot ${farmSlotId}`);
    }

    try {
      const nextWaterAt = PlantCareUtils.applyWater(slot.currentSlotPlant);
      slot.currentSlotPlant.updated_at = new Date();
      await this.slotPlantRepo.save(slot.currentSlotPlant);
      return {
        message: 'Cây đã được tưới nước!',
        nextWaterAt,
      };
    } catch (err: any) {
      throw new BadRequestException(err.message || 'Failed to water plant');
    }
  }

  async catchBug(userId: string, farmSlotId: string) {
    const slot = await this.farmSlotRepo.findOne({
      where: { id: farmSlotId },
      relations: ['currentSlotPlant'],
    });
    if (!slot?.currentSlotPlant)
      throw new NotFoundException('No plant on this slot');

    try {
      const nextBugAt = PlantCareUtils.applyCatchBug(slot.currentSlotPlant);
      await this.slotPlantRepo.save(slot.currentSlotPlant);
      return {
        message: 'Cây đã được bắt hết sâu bọ!',
        nextBugAt,
      };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async getSlotWithPlantById(
    slotId: string,
  ): Promise<SlotWithStatusDto | null> {
    const slot = await this.farmSlotRepo.findOne({
      where: { id: slotId },
      relations: ['currentSlotPlant', 'currentSlotPlant.plant'],
    });

    if (!slot) return null;

    const mapped = await this.mapSlotsWithStatus([slot]);
    return mapped[0] || null;
  }

  async getUserHarvestStat(userId: string, clanId?: string) {
    const stat = await this.userClanStatRepo.findOne({
      where: {
        user_id: userId,
        ...(clanId ? { clan_id: clanId } : {}),
      },
    });
    const farmConfig = this.getFarmConfig();
    const used = stat?.harvest_count_use ?? 0;
    const max = farmConfig.HARVEST.ENABLE_LIMIT
      ? farmConfig.HARVEST.MAX_HARVEST
      : FARM_CONFIG.HARVEST.UNLIMITED;

    const remaining =
      max === farmConfig.HARVEST.UNLIMITED
        ? FARM_CONFIG.HARVEST.UNLIMITED
        : Math.max(max - used, 0);

    return { used, max, remaining };
  }

  async harvestPlant(userId: string, farmSlotId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['clan', 'clan.farm'],
    });
    if (!user?.clan) throw new BadRequestException('Người chơi không có clan');

    const slotClanId = await this.getClanByFarmSlot(farmSlotId);
    if (!slotClanId) throw new BadRequestException('Farm slot không thuộc clan nào');

    let catRateBonus = 0;
    let birdRateBonus = 0;

    if (user.clan.id === slotClanId) {
      const activePetClanAnimals = await this.clanAnimalsService.getListClanAnimalsByClanId({
        clan_id: user.clan.id,
        is_active: true,
      });

      for (const pet of activePetClanAnimals) {
        switch (pet.pet_clan?.type) {
          case PetClanType.CAT:
            catRateBonus += pet.total_rate_affect ?? 0;
            break;
          case PetClanType.BIRD:
            birdRateBonus += pet.total_rate_affect ?? 0;
            break;
        }
      }
    }

    const { score } = await this.userClanStatService.getOrCreateUserClanStat(
      userId,
      user.clan.id,
    );
    const used = score?.harvest_count_use ?? 0;
    const farmConfig = this.getFarmConfig();
    const max = farmConfig.HARVEST.ENABLE_LIMIT
      ? farmConfig.HARVEST.MAX_HARVEST
      : farmConfig.HARVEST.UNLIMITED;
    if (farmConfig.HARVEST.ENABLE_LIMIT && used >= max) {
      throw new BadRequestException({
        message: 'Đã sử dụng hết lượt thu hoạch',
        remaining: 0,
        max,
      });
    }

    const slot = await this.farmSlotRepo.findOne({
      where: { id: farmSlotId },
      relations: ['currentSlotPlant', 'currentSlotPlant.plant', 'farm'],
    });
    if (!slot?.currentSlotPlant)
      throw new NotFoundException('No plant on this slot');

    const slotPlant = slot.currentSlotPlant;
    const canHarvest = PlantCareUtils.checkCanHarvest(
      slotPlant.created_at,
      slotPlant.grow_time,
      slotPlant.harvest_count,
      this.getFarmConfig(),
    );
    if (!canHarvest)
      throw new BadRequestException('Plant not ready for harvest');

    slotPlant.harvest_count ??= 0;
    slotPlant.harvest_count += 1;
    slotPlant.harvest_at = new Date();
    slotPlant.last_harvested_by = user.id;
    const isIntruder = slot.farm.clan_id !== user.clan.id;
    let warehouseItem = await this.clanWarehouseRepo.findOne({
      where: {
        clan_id: user.clan.id,
        plant_id: slotPlant.plant_id,
        is_harvested: true,
      },
    });
    if (!warehouseItem) {
      warehouseItem = this.clanWarehouseRepo.create({
        clan_id: user.clan.id,
        plant_id: slotPlant.plant_id,
        quantity: 0,
        is_harvested: true,
      });
    }
    warehouseItem.quantity += 1;
    await this.clanWarehouseRepo.save(warehouseItem);

    const { totalWater, totalBug } = PlantCareUtils.calculateCareNeeds(
      slotPlant.grow_time,
    );
    const waterRatio = Math.min(slotPlant.total_water_count / totalWater, 1);
    const bugRatio = Math.min(slotPlant.total_bug_caught / totalBug, 1);
    const careRatio =
      farmConfig.HARVEST.FORMULA.WATER_WEIGHT * waterRatio +
      farmConfig.HARVEST.FORMULA.BUG_WEIGHT * bugRatio;
    const baseScore = slotPlant.plant?.harvest_point ?? 1;
    const multiplierRatio =
      farmConfig.HARVEST.FORMULA.MIN_MULTIPLIER +
      farmConfig.HARVEST.FORMULA.CARE_FACTOR * careRatio;
    const clanMultiplier = isIntruder
      ? farmConfig.HARVEST.FORMULA.OTHER_CLAN
      : farmConfig.HARVEST.FORMULA.MY_CLAN;
    const careBonus = Math.round((multiplierRatio - 1) * 100);
    const finalScore = Math.ceil(baseScore * multiplierRatio * clanMultiplier);
    const bonusPercent = Math.round(
      ((finalScore - baseScore) / baseScore) * 100,
    );

    const goldBonusMultiplier = 1 + catRateBonus / 100;
    const scoreBonusMultiplier = 1 + birdRateBonus / 100;

    const finalGold = Math.ceil(finalScore * goldBonusMultiplier);
    const finalPlayerScore = Math.ceil(finalScore * scoreBonusMultiplier);

    await this.clanFundService.addToFund(user.clan.id, user, {
      type: ClanFundType.GOLD,
      amount: finalGold,
    });

    if (isIntruder) {
      await this.clanActivityService.logActivity({
        clanId: slot.farm.clan_id,
        userId: user.id,
        actionType: ClanActivityActionType.HARVEST_INTRUDER,
        itemName: slotPlant.plant?.name ?? 'vật phẩm',
        quantity: 1,
        amount: finalGold,
        officeName: user.clan.farm?.name ?? user.clan.name + ' Farm',
      });

      await this.clanActivityService.logActivity({
        clanId: user.clan.id,
        userId: user.id,
        actionType: ClanActivityActionType.HARVESTED_OTHER_FARM,
        itemName: slotPlant.plant?.name ?? 'vật phẩm',
        quantity: 1,
        amount: finalGold,
        officeName: slot.farm.name,
      });
    } else {
      await this.clanActivityService.logActivity({
        clanId: user.clan.id,
        userId: user.id,
        actionType: ClanActivityActionType.HARVEST,
        itemName: slotPlant.plant?.name ?? 'vật phẩm',
        quantity: 1,
        amount: finalGold,
        officeName: slot.farm.name ?? user.clan.name + ' Farm',
      });
    }

    await this.userClanStatService.addScore(
      user.id,
      user.clan.id,
      finalPlayerScore,
      farmConfig.HARVEST.ENABLE_LIMIT,
    );
    slot.current_slot_plant_id = null;
    await this.farmSlotRepo.save(slot);
    await this.slotPlantRepo.softRemove(slotPlant);

    if (slot.farm.clan_id === user.clan.id) {
      await this.clanAnimalsService.gainExpForActiveClanAnimals(user.clan.id, slotPlant.plant.harvest_point || 1);
    }

    return {
      success: true,
      message: isIntruder
        ? 'Harvest (intruder) successful'
        : 'Harvest successful',
      remaining: farmConfig.HARVEST.ENABLE_LIMIT
        ? Math.max(max - (used + 1), 0)
        : farmConfig.HARVEST.UNLIMITED,
      baseScore: baseScore,
      careBonus,
      clanMultiplier,
      finalScore: finalScore,
      finalPlayerScore: finalPlayerScore,
      finalGold: finalGold,
      bonusPercent: bonusPercent,
      catRateBonus: catRateBonus,
      catGoldBonus: Math.ceil(finalScore * catRateBonus / 100),
      birdRateBonus: birdRateBonus,
      birdScoreBonus: Math.ceil(finalScore * birdRateBonus / 100),
      max: farmConfig.HARVEST.ENABLE_LIMIT
        ? farmConfig.HARVEST.MAX_HARVEST
        : farmConfig.HARVEST.UNLIMITED,
    };
  }

  async incrementHarvestInterrupted(
    interrupterId: string,
    interrupterClanId: string,
    targetId: string,
    targetClanId: string,
  ) {
    const interrupterStat = await this.userClanStatRepo.findOne({
      where: {
        user_id: interrupterId,
        ...(interrupterClanId ? { clan_id: interrupterClanId } : {}),
      },
    });

    if (!interrupterStat) {
      throw new NotFoundException('Không tìm thấy người phá');
    }

    const farmConfig = this.getFarmConfig();
    interrupterStat.harvest_interrupt_count_use ??= 0;

    if (
      farmConfig.HARVEST.ENABLE_LIMIT &&
      interrupterStat.harvest_interrupt_count_use >=
      farmConfig.HARVEST.MAX_INTERRUPT
    ) {
      throw new BadRequestException('Người phá đã hết lượt phá thu hoạch!');
    }

    if (farmConfig.HARVEST.ENABLE_LIMIT) {
      interrupterStat.harvest_interrupt_count_use += 1;
      await this.userClanStatRepo.save(interrupterStat);
    }

    const targetStat = await this.userClanStatRepo.findOne({
      where: {
        user_id: targetId,
        ...(targetClanId ? { clan_id: targetClanId } : {}),
      },
    });

    if (!targetStat) {
      throw new NotFoundException('Không tìm thấy người đang thu hoạch');
    }

    targetStat.harvest_count_use ??= 0;
    if (
      farmConfig.HARVEST.ENABLE_LIMIT &&
      targetStat.harvest_count_use >= farmConfig.HARVEST.MAX_HARVEST
    ) {
      throw new BadRequestException(
        'Người thu hoạch bị phá đã hết lượt thu hoạch!',
      );
    }

    if (farmConfig.HARVEST.ENABLE_LIMIT) {
      targetStat.harvest_count_use += 1;
      await this.userClanStatRepo.save(targetStat);
    }

    return {
      interrupter: {
        used: interrupterStat.harvest_interrupt_count_use,
        max: farmConfig.HARVEST.ENABLE_LIMIT
          ? farmConfig.HARVEST.MAX_INTERRUPT
          : farmConfig.HARVEST.UNLIMITED,
        remaining: farmConfig.HARVEST.ENABLE_LIMIT
          ? farmConfig.HARVEST.MAX_INTERRUPT -
          interrupterStat.harvest_interrupt_count_use
          : farmConfig.HARVEST.UNLIMITED,
      },
      target: {
        used: targetStat.harvest_count_use,
        max: farmConfig.HARVEST.ENABLE_LIMIT
          ? farmConfig.HARVEST.MAX_HARVEST
          : farmConfig.HARVEST.UNLIMITED,
        remaining: farmConfig.HARVEST.ENABLE_LIMIT
          ? farmConfig.HARVEST.MAX_HARVEST - targetStat.harvest_count_use
          : farmConfig.HARVEST.UNLIMITED,
      },
    };
  }

  async decreaseHarvestCount(farmSlotId: string) {
    const slot = await this.farmSlotRepo.findOne({
      where: { id: farmSlotId },
      relations: ['currentSlotPlant'],
    });
    if (!slot?.currentSlotPlant) return null;

    const slotPlant = slot.currentSlotPlant;
    slotPlant.harvest_count ??= 0;
    slotPlant.harvest_count += 1;

    const farmConfig = this.getFarmConfig();
    const maxHarvest = farmConfig.PLANT.ENABLE_LIMIT
      ? farmConfig.PLANT.MAX_HARVEST
      : farmConfig.HARVEST.UNLIMITED;

    const remaining =
      maxHarvest === farmConfig.PLANT.UNLIMITED
        ? farmConfig.PLANT.UNLIMITED
        : Math.max(maxHarvest - slotPlant.harvest_count, 0);

    if (
      maxHarvest !== farmConfig.PLANT.UNLIMITED &&
      slotPlant.harvest_count >= maxHarvest
    ) {
      slot.current_slot_plant_id = null;
      await this.farmSlotRepo.save(slot);
      await this.slotPlantRepo.softRemove(slotPlant);
    } else {
      await this.slotPlantRepo.save(slotPlant);
    }

    return {
      used: slotPlant.harvest_count,
      max: maxHarvest,
      remaining,
    };
  }
}
