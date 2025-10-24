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
  PlantStatusDto,
} from './dto/farm-slot.dto';
import { FarmWarehouseEntity } from '@modules/farm-warehouse/entity/farm-warehouse.entity';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { PlantState } from '@modules/plant/dto/plant.dto';
import { FarmEntity } from '@modules/farm/entity/farm.entity';

@Injectable()
export class FarmSlotService {
  constructor(
    @InjectRepository(FarmSlotEntity)
    private readonly farmSlotRepo: Repository<FarmSlotEntity>,
    @InjectRepository(SlotsPlantEntity)
    private readonly slotPlantRepo: Repository<SlotsPlantEntity>,
    @InjectRepository(PlantEntity)
    private readonly plantRepo: Repository<PlantEntity>,
    @InjectRepository(FarmWarehouseEntity)
    private readonly warehouseRepo: Repository<FarmWarehouseEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(FarmEntity)
    private readonly farmRepo: Repository<FarmEntity>,
    @InjectRepository(ClanEntity)
    private readonly clanRepo: Repository<ClanEntity>,
  ) {}

  // mốc chuẩn
  private readonly baseGrowTime = 600; // 10 phút
  private readonly baseWaterCount = 2;
  private readonly baseBugCount = 1;
  private calculateCareNeeds(growTimeSeconds: number) {
    const totalWater = Math.max(
      1,
      Math.round(this.baseWaterCount * (growTimeSeconds / this.baseGrowTime)),
    );
    const totalBug = Math.max(
      1,
      Math.round(this.baseBugCount * (growTimeSeconds / this.baseGrowTime)),
    );
    return { totalWater, totalBug };
  }

  private calculatePlantStage(
    createdAt: Date,
    growTimeSeconds: number,
  ): PlantState {
    const elapsed = (Date.now() - createdAt.getTime()) / 1000;
    const ratio = Math.min(elapsed / growTimeSeconds, 1);

    if (ratio >= 1.0) return PlantState.HARVESTABLE;
    if (ratio >= 0.8) return PlantState.GROWING;
    if (ratio >= 0.3) return PlantState.SMALL;
    return PlantState.SEED;
  }

  async plantToSlot(userId: string, dto: PlantOnSlotDto) {
    const slot = await this.farmSlotRepo.findOne({
      where: { id: dto.farm_slot_id },
    });
    if (!slot) throw new NotFoundException('Farm slot not found');
    if (slot.current_slot_plant_id)
      throw new BadRequestException('Slot already has a planted crop');

    const plant = await this.plantRepo.findOne({ where: { id: dto.plant_id } });
    if (!plant) throw new NotFoundException('Plant not found');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const warehouseItem = await this.warehouseRepo.findOne({
      where: { plant_id: plant.id },
    });
    if (!warehouseItem || warehouseItem.quantity <= 0)
      throw new BadRequestException('Not enough seeds in warehouse');

    warehouseItem.quantity -= 1;
    await this.warehouseRepo.save(warehouseItem);

    const now = new Date();
    const harvestAt = new Date(now.getTime() + plant.grow_time * 1000);
    const care = this.calculateCareNeeds(plant.grow_time);

    const slotPlant = this.slotPlantRepo.create({
      farm_slot_id: slot.id,
      plant_id: plant.id,
      planted_by: user.id,
      grow_time_seconds: plant.grow_time,
      harvest_at: harvestAt,
      total_water_count: 0,
      total_bug_caught: 0,
      expected_water_count: care.totalWater,
      expected_bug_count: care.totalBug,
      last_watered_at: null,
      need_water_until: now,
      bug_until: new Date(
        now.getTime() + (plant.grow_time / care.totalBug) * 1000,
      ),
    });

    const saved = await this.slotPlantRepo.save(slotPlant);
    slot.current_slot_plant_id = saved.id;
    await this.farmSlotRepo.save(slot);

    return {
      message: 'Planted successfully!',
      currentPlant: {
        plant_id: plant.id,
        plant_name: plant.name,
        grow_time: plant.grow_time,
        stage: PlantState.SEED,
        need_water: true,
        has_bug: false,
        harvest_at: harvestAt,
        created_at: now,
      },
    };
  }

  async waterPlant(userId: string, farmSlotId: string) {
    const slot = await this.farmSlotRepo.findOne({
      where: { id: farmSlotId },
      relations: ['currentSlotPlant', 'currentSlotPlant.plant'],
    });
    if (!slot || !slot.currentSlotPlant)
      throw new NotFoundException('No plant on this slot');

    const p = slot.currentSlotPlant;
    const care = this.calculateCareNeeds(p.grow_time_seconds);
    const now = new Date();

    if (p.total_water_count >= care.totalWater)
      throw new BadRequestException('Plant already fully watered');
    if (p.need_water_until && p.need_water_until > now) {
      const remain = Math.ceil(
        (p.need_water_until.getTime() - now.getTime()) / 1000,
      );
      throw new BadRequestException(`You can water again in ${remain}s`);
    }

    const nextInterval = p.grow_time_seconds / care.totalWater;
    p.total_water_count += 1;
    p.last_watered_at = now;
    p.need_water_until = new Date(now.getTime() + nextInterval * 1000);

    await this.slotPlantRepo.save(p);
    return {
      message: 'Watered successfully!',
      nextWaterAt: p.need_water_until,
    };
  }

  async catchBug(userId: string, farmSlotId: string) {
    const slot = await this.farmSlotRepo.findOne({
      where: { id: farmSlotId },
      relations: ['currentSlotPlant', 'currentSlotPlant.plant'],
    });
    if (!slot || !slot.currentSlotPlant)
      throw new NotFoundException('No plant on this slot');

    const p = slot.currentSlotPlant;
    const care = this.calculateCareNeeds(p.grow_time_seconds);
    const now = new Date();

    if (p.total_bug_caught >= care.totalBug)
      throw new BadRequestException('All bugs already caught');
    if (p.bug_until && p.bug_until > now) {
      const remain = Math.ceil((p.bug_until.getTime() - now.getTime()) / 1000);
      throw new BadRequestException(`No bugs to catch yet, wait ${remain}s`);
    }

    const nextBugInterval = p.grow_time_seconds / care.totalBug;
    p.total_bug_caught += 1;
    p.last_bug_caught_at = now;
    p.bug_until = new Date(now.getTime() + nextBugInterval * 1000);

    await this.slotPlantRepo.save(p);
    return { message: 'Bug caught successfully!', nextBugAt: p.bug_until };
  }

  async harvestPlant(
    userId: string,
    farmSlotId: string,
  ): Promise<PlantStatusDto> {
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
    if (elapsed < slotPlant.grow_time_seconds)
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

    let warehouseItem = await this.warehouseRepo.findOne({
      where: { plant_id: slotPlant.plant_id },
    });
    if (!warehouseItem) {
      warehouseItem = this.warehouseRepo.create({
        plant_id: slotPlant.plant_id,
        quantity: 0,
      });
    }
    warehouseItem.quantity += 1;
    await this.warehouseRepo.save(warehouseItem);

    return {
      id: slotPlant.id,
      plant_id: slotPlant.plant_id,
      plant_name: slotPlant.plant?.name || '',
      stage: PlantState.HARVESTABLE,
      planted_by: slotPlant.planted_by,
      grow_time: slotPlant.plant.grow_time,
      need_water: false,
      has_bug: false,
      harvest_at: new Date(),
      created_at: slotPlant.created_at,
      updated_at: new Date(),
    };
  }
  async getFarmWithSlotsByClan(clan_id: string): Promise<FarmWithSlotsDto> {
    if (!clan_id) throw new NotFoundException('clan_id is required');

    const farm = await this.farmRepo.findOne({
      where: { clan_id },
      relations: [
        'slots',
        'slots.currentSlotPlant',
        'slots.currentSlotPlant.plant',
        'warehouseSlots',
      ],
    });

    if (!farm)
      throw new NotFoundException(`Farm for clan_id ${clan_id} not found`);

    farm.slots.sort((a, b) => a.slot_index - b.slot_index);
    const slotsWithStatus = this.mapSlotsWithStatus(farm.slots);

    return {
      farm_id: farm.id,
      warehouseSlots: farm.warehouseSlots || [],
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
        'warehouseSlots',
      ],
    });

    if (!farm) throw new NotFoundException(`Farm with id ${farm_id} not found`);

    farm.slots.sort((a, b) => a.slot_index - b.slot_index);
    const slotsWithStatus = this.mapSlotsWithStatus(farm.slots);

    return {
      farm_id: farm.id,
      warehouseSlots: farm.warehouseSlots || [],
      slots: slotsWithStatus,
    };
  }

  private mapSlotsWithStatus(slots: FarmSlotEntity[]) {
    const now = new Date();

    return slots.map((slot) => {
      const p = slot.currentSlotPlant;
      if (!p)
        return { id: slot.id, slot_index: slot.slot_index, currentPlant: null };

      const stage = this.calculatePlantStage(p.created_at, p.grow_time_seconds);
      const care = this.calculateCareNeeds(p.grow_time_seconds);

      const needWater =
        p.total_water_count < care.totalWater &&
        (!p.need_water_until || p.need_water_until < now);

      const hasBug =
        p.total_bug_caught < care.totalBug &&
        (!p.bug_until || p.bug_until < now);

      const growEnd = p.created_at.getTime() + p.grow_time_seconds * 1000;
      const remain = Math.max(0, Math.ceil((growEnd - now.getTime()) / 1000));
      const canHarvest = remain <= 0;

      return {
        id: slot.id,
        slot_index: slot.slot_index,
        currentPlant: {
          id: p.id,
          plant_id: p.plant_id,
          plant_name: p.plant?.name || '',
          planted_by: p.planted_by,
          grow_time: p.grow_time_seconds,
          grow_time_remain: remain,
          stage,
          harvest_at: p.harvest_at,
          can_harvest: canHarvest,
          need_water: needWater,
          has_bug: hasBug,
          created_at: p.created_at,
          updated_at: p.updated_at,
        },
      };
    });
  }
}
