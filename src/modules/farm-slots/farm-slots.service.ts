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
import { ClanActivityActionType, PlantState } from '@enum';
import { CLAN_WAREHOUSE, FARM_CONFIG } from '@constant/farm.constant';
import { UserClanStatEntity as UserClanStatEntity } from '@modules/user-clan-stat/entity/user-clan-stat.entity';
import { UserClanStatService } from '@modules/user-clan-stat/user-clan-stat.service';
import { ClanActivityService } from '@modules/clan-activity/clan-activity.service';

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
  ) {}

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
        const canHarvest = PlantCareUtils.checkCanHarvest(
          p.created_at,
          p.grow_time,
          p.harvest_count,
          p.harvest_count_max,
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
    const now = new Date();
    const deathAt = new Date(
      plant.created_at.getTime() + FARM_CONFIG.PLANT.DEATH_MS,
    );

    if (
      now >= deathAt &&
      (plant.harvest_count ?? 0) < FARM_CONFIG.PLANT.MAX_HARVEST
    ) {
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

    await this.clanWarehouseService.updateClanWarehouseItem(
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

    const used = stat?.harvest_count_use ?? 0;
    const max = stat?.harvest_count ?? FARM_CONFIG.HARVEST.MAX_HARVEST;
    const remaining = Math.max(max - used, 0);

    return { used, max, remaining };
  }

  async harvestPlant(userId: string, farmSlotId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['clan', 'clan.farm'],
    });
    if (!user?.clan) throw new BadRequestException('Người chơi không có clan');

    const { score } = await this.userClanStatService.getOrCreateUserClanStat(
      userId,
      user.clan.id,
    );
    const used = score?.harvest_count_use ?? 0;
    const max = score?.harvest_count ?? 0;
    if (used >= max)
      throw new BadRequestException({
        message: 'Đã sử dụng hết lượt thu hoạch',
        remaining: 0,
        max,
      });
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
      slotPlant.harvest_count_max,
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
        item_id: slotPlant.plant_id,
        is_harvested: true,
      },
    });
    if (!warehouseItem) {
      warehouseItem = this.clanWarehouseRepo.create({
        clan_id: user.clan.id,
        item_id: slotPlant.plant_id,
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
    const careRatio = FARM_CONFIG.HARVEST.FORMULA.WATER_WEIGHT * waterRatio + FARM_CONFIG.HARVEST.FORMULA.BUG_WEIGHT * bugRatio;
    const basePoint = slotPlant.plant?.harvest_point ?? 1;
    const multiplierRatio = FARM_CONFIG.HARVEST.FORMULA.MIN_MULTIPLIER + FARM_CONFIG.HARVEST.FORMULA.CARE_FACTOR * careRatio;
    const clanMultiplier = FARM_CONFIG.HARVEST.FORMULA.MY_CLAN;
    const finalScore = Math.floor(basePoint * multiplierRatio * clanMultiplier);

    if (isIntruder) {
      await this.clanActivityService.logActivity({
        clanId: slot.farm.clan_id,
        userId: user.id,
        actionType: ClanActivityActionType.HARVEST_INTRUDER,
        itemName: slotPlant.plant?.name ?? 'vật phẩm',
        quantity: 1,
        officeName: user.clan.farm?.name ?? (user.clan.name + " Farm"),
      });

      await this.clanActivityService.logActivity({
        clanId: user.clan.id,
        userId: user.id,
        actionType: ClanActivityActionType.HARVESTED_OTHER_FARM,
        itemName: slotPlant.plant?.name ?? 'vật phẩm',
        quantity: 1,
        officeName: slot.farm.name,
      });
    } else {
      await this.clanActivityService.logActivity({
        clanId: user.clan.id,
        userId: user.id,
        actionType: ClanActivityActionType.HARVEST,
        itemName: slotPlant.plant?.name ?? 'vật phẩm',
        quantity: 1,
        officeName: slot.farm.name ?? (user.clan.name + " Farm"),
      });
    }

    await this.userClanStatService.addScore(user.id, user.clan.id, finalScore);
    slot.current_slot_plant_id = null;
    await this.farmSlotRepo.save(slot);
    await this.slotPlantRepo.softRemove(slotPlant);
    return {
      success: true,
      message: isIntruder
        ? 'Harvest (intruder) successful'
        : 'Harvest successful',
      remaining: Math.max(max - (used + 1), 0),
      max,
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

    interrupterStat.harvest_interrupt_count_use ??= 0;
    interrupterStat.harvest_interrupt_count ??=
      FARM_CONFIG.HARVEST.MAX_INTERRUPT;

    if (
      interrupterStat.harvest_interrupt_count_use >=
      interrupterStat.harvest_interrupt_count
    ) {
      throw new BadRequestException('Người phá đã hết lượt phá thu hoạch!');
    }

    interrupterStat.harvest_interrupt_count_use += 1;
    await this.userClanStatRepo.save(interrupterStat);

    const interrupterRemaining =
      interrupterStat.harvest_interrupt_count -
      interrupterStat.harvest_interrupt_count_use;

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
    targetStat.harvest_count ??= FARM_CONFIG.HARVEST.MAX_HARVEST;

    if (targetStat.harvest_count_use >= targetStat.harvest_count) {
      throw new BadRequestException(
        'Người thu hoạch bị phá đã hết lượt thu hoạch!',
      );
    }

    targetStat.harvest_count_use += 1;
    await this.userClanStatRepo.save(targetStat);

    const targetRemaining =
      targetStat.harvest_count - targetStat.harvest_count_use;

    return {
      interrupter: {
        used: interrupterStat.harvest_interrupt_count_use,
        max: interrupterStat.harvest_interrupt_count,
        remaining: interrupterRemaining,
      },
      target: {
        used: targetStat.harvest_count_use,
        max: targetStat.harvest_count,
        remaining: targetRemaining,
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

    const maxHarvest =
      slotPlant.harvest_count_max ?? FARM_CONFIG.PLANT.MAX_HARVEST;

    const remaining = Math.max(maxHarvest - slotPlant.harvest_count, 0);

    if (slotPlant.harvest_count >= maxHarvest) {
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
