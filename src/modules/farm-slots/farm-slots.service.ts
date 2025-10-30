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
import { PlantState } from '@enum';
import { CLAN_WAREHOUSE } from '@constant/farm.constant';

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
    @InjectRepository(ClanEntity)
    private readonly clanRepo: Repository<ClanEntity>,
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

          await this.slotPlantRepo.save(p);
        }

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

  async plantToSlot(userId: string, dto: PlantOnSlotDto) {
    const slot = await this.farmSlotRepo.findOne({
      where: { id: dto.farm_slot_id },
      relations: ['farm'],
    });
    if (!slot) throw new NotFoundException('Farm slot not found');
    if (slot.current_slot_plant_id)
      throw new BadRequestException('Slot already has a planted crop');

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
    const harvestAt = new Date(now.getTime() + plant.grow_time * 1000);
    const care = PlantCareUtils.calculateCareNeeds(plant.grow_time);

    const slotPlant = this.slotPlantRepo.create({
      farm_slot_id: slot.id,
      plant_id: plant.id,
      planted_by: user.id,
      grow_time: plant.grow_time,
      harvest_at: harvestAt,
      expected_water_count: care.totalWater,
      expected_bug_count: care.totalBug,
      created_at: now,
      updated_at: now,
    });

    const saved = await this.slotPlantRepo.save(slotPlant);
    slot.current_slot_plant_id = saved.id;
    await this.farmSlotRepo.save(slot);

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
        harvest_at: harvestAt,
        can_harvest: false,
        need_water: true,
        has_bug: false,
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

  async harvestPlant(
    userId: string,
    farmSlotId: string,
  ): Promise<SlotsPlantEntity> {
    const slot = await this.farmSlotRepo.findOne({
      where: { id: farmSlotId },
      relations: [
        'currentSlotPlant',
        'currentSlotPlant.plant',
        'farm',
        'farm.clan',
      ],
    });

    if (!slot || !slot.currentSlotPlant)
      throw new NotFoundException('No plant growing on this slot');

    const slotPlant = slot.currentSlotPlant;
    const elapsed = (Date.now() - slotPlant.created_at.getTime()) / 1000;
    if (elapsed < slotPlant.grow_time)
      throw new BadRequestException('Plant not ready for harvest yet');

    const userWithClan = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['clan'],
    });
    if (!userWithClan?.clan)
      throw new BadRequestException('User must belong to a clan to harvest.');

    const userClan = userWithClan.clan;
    const farmClanId = slot.farm?.clan_id;
    const multiplier = userClan.id === farmClanId ? 2 : 1;

    const plantEntity = slotPlant.plant;
    const harvestPoint = plantEntity?.harvest_point || 1;
    const scoreToAdd = multiplier * harvestPoint;
    userClan.score = (userClan.score || 0) + scoreToAdd;
    await this.clanRepo.save(userClan);

    slotPlant.harvest_count = (slotPlant.harvest_count || 0) + 1;
    const isLastHarvest =
      slotPlant.harvest_count >= (slotPlant.harvest_count_max || 10);

    if (isLastHarvest) {
      slot.current_slot_plant_id = null;
      await this.farmSlotRepo.save(slot);
      await this.slotPlantRepo.remove(slotPlant);
    } else {
      slotPlant.harvest_at = new Date();
      await this.slotPlantRepo.save(slotPlant);
    }

    let warehouseItem = await this.clanWarehouseRepo.findOne({
      where: { item_id: slotPlant.plant_id },
    });
    if (!warehouseItem) {
      warehouseItem = this.clanWarehouseRepo.create({
        item_id: slotPlant.plant_id,
        quantity: 0,
      });
    }
    warehouseItem.quantity += 1;
    await this.clanWarehouseRepo.save(warehouseItem);

    return slotPlant;
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

  async updateSlotPlantTimes(
    slotId: string,
    updates: Partial<SlotsPlantEntity>,
  ): Promise<void> {
    const slot = await this.farmSlotRepo.findOne({
      where: { id: slotId },
      relations: ['currentSlotPlant'],
    });

    if (!slot?.currentSlotPlant) return;

    Object.assign(slot.currentSlotPlant, updates, { updated_at: new Date() });
    await this.slotPlantRepo.save(slot.currentSlotPlant);
  }
}
