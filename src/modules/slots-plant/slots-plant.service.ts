import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlotsPlantEntity } from './entity/slots-plant.entity';
import { FarmSlotEntity } from '@modules/farm-slots/entity/farm-slots.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { SlotActionDto, SlotHarvesterDto, SlotHistoryDto } from './dto/slots-plant.dto';

@Injectable()
export class SlotsPlantService {
  constructor(
    @InjectRepository(SlotsPlantEntity)
    private readonly slotPlantRepo: Repository<SlotsPlantEntity>,
    @InjectRepository(FarmSlotEntity)
    private readonly farmSlotRepo: Repository<FarmSlotEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(ClanEntity)
    private readonly clanRepo: Repository<ClanEntity>,
    @InjectRepository(PlantEntity)
    private readonly plantRepo: Repository<PlantEntity>,
  ) {}

  async getSlotHistory(slotId: string): Promise<SlotHistoryDto[]> {
    const slot = await this.farmSlotRepo.findOne({
      where: { id: slotId },
      relations: ['historyPlants', 'historyPlants.plant', 'historyPlants.plantedByUser'],
    });
    if (!slot) throw new NotFoundException('Slot not found');

    return slot.historyPlants.map((p) => ({
      id: p.id,
      plant_id: p.plant_id,
      plant_name: p.plant?.name || '',
      planted_by: p.planted_by,
      planted_by_name: p.plantedByUser?.username || '',
      planted_at: p.created_at,
      harvest_count: p.harvest_count,
      harvest_count_max: p.harvest_count_max,
      harvest_at: p.harvest_at,
      last_watered_by: p.last_watered_by,
      last_bug_caught_by: p.last_bug_caught_by,
      last_harvested_by: p.last_harvested_by,
    }));
  }

  async getSlotHarvesters(slotId: string): Promise<{ slot_id: string; harvesters: SlotHarvesterDto[] }> {
    const plants = await this.slotPlantRepo.find({
      where: { farm_slot_id: slotId },
      relations: ['plantedByUser', 'plantedByUser.clan'],
    });
    if (!plants.length) throw new NotFoundException('No harvest data for this slot');

    const harvesters: SlotHarvesterDto[] = [];
    for (const p of plants) {
      if (!p.last_harvested_by) continue;
      const user = await this.userRepo.findOne({
        where: { id: p.last_harvested_by },
        relations: ['clan'],
      });
      if (!user || !user.clan) continue;
      harvesters.push({
        user_id: user.id,
        username: user.username,
        clan_id: user.clan.id,
        points_added: p.harvest_count,
        harvested_at: p.harvest_at,
      });
    }
    return { slot_id: slotId, harvesters };
  }

  async getSlotScore(slotId: string): Promise<{ slot_id: string; total_points: number; by_user: { user_id: string; points: number }[] }> {
    const plants = await this.slotPlantRepo.find({
      where: { farm_slot_id: slotId },
      relations: ['plant', 'plantedByUser', 'plantedByUser.clan'],
    });
    let totalPoints = 0;
    const byUser: { user_id: string; points: number }[] = [];

    for (const p of plants) {
      if (!p.last_harvested_by) continue;
      const user = await this.userRepo.findOne({ where: { id: p.last_harvested_by }, relations: ['clan'] });
      if (!user || !user.clan) continue;
      const points = (p.plant?.harvest_point || 1) * p.harvest_count;
      totalPoints += points;
      byUser.push({ user_id: user.id, points });
    }

    return { slot_id: slotId, total_points: totalPoints, by_user: byUser };
  }

  async getFarmScore(farmId: string): Promise<{ clan_id: string; total_points: number }[]> {
    const slots = await this.farmSlotRepo.find({
      where: { farm_id: farmId },
      relations: ['historyPlants', 'historyPlants.plant', 'historyPlants.plantedByUser', 'historyPlants.plantedByUser.clan'],
    });

    const clanScores: Record<string, number> = {};
    for (const slot of slots) {
      for (const p of slot.historyPlants) {
        if (!p.last_harvested_by) continue;
        const clan = p.plantedByUser?.clan;
        if (!clan) continue;
        const points = (p.plant?.harvest_point || 1) * p.harvest_count;
        clanScores[clan.id] = (clanScores[clan.id] || 0) + points;
      }
    }

    return Object.entries(clanScores).map(([clan_id, total_points]) => ({ clan_id, total_points }));
  }

  async getSlotActions(slotId: string): Promise<{ slot_id: string; actions: SlotActionDto[] }> {
    const plants = await this.slotPlantRepo.find({
      where: { farm_slot_id: slotId },
      relations: ['plantedByUser', 'plant'],
    });

    const actions: SlotActionDto[] = [];
    for (const p of plants) {
      actions.push({
        plant_id: p.plant_id,
        plant_name: p.plant?.name || null,
        planted_by: p.planted_by,
        planted_at: p.created_at,
        last_watered_by: p.last_watered_by,
        last_watered_at: p.last_watered_at,
        last_bug_caught_by: p.last_bug_caught_by,
        last_bug_caught_at: p.last_bug_caught_at,
        last_harvested_by: p.last_harvested_by,
        harvest_at: p.harvest_at,
      });
    }
    return { slot_id: slotId, actions };
  }
}
