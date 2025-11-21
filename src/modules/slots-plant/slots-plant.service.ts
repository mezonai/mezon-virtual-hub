import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlotsPlantEntity } from './entity/slots-plant.entity';
import { ActivePlantsQueryDto } from './dto/slots-plant.dto';

@Injectable()
export class SlotsPlantService {
  constructor(
    @InjectRepository(SlotsPlantEntity)
    private readonly slotPlantRepo: Repository<SlotsPlantEntity>,
  ) {}

  async getAllSlotPlants(): Promise<SlotsPlantEntity[]> {
    return this.slotPlantRepo.find({
      relations: ['plant', 'plantedByUser', 'farmSlot'],
      order: {
        deleted_at: 'ASC',
        created_at: 'ASC',
      },
      withDeleted: true,
    });
  }

  async getActivePlantsInSlot(
    farmSlotId: string,
    filters?: ActivePlantsQueryDto,
  ): Promise<(SlotsPlantEntity & { isRemoved: false })[]> {
    const query = this.slotPlantRepo
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.plant', 'plant')
      .leftJoinAndSelect('sp.plantedByUser', 'user')
      .leftJoinAndSelect('sp.farmSlot', 'slot')
      .where('sp.farm_slot_id = :farmSlotId', { farmSlotId })
      .andWhere('sp.deleted_at IS NULL');

    if (filters?.userId) query.andWhere('sp.planted_by = :userId', { userId: filters.userId });
    if (filters?.plantName)
      query.andWhere('sp.plant_name ILIKE :plantName', { plantName: `%${filters.plantName}%` });
    if (filters?.stage !== undefined) query.andWhere('sp.stage = :stage', { stage: filters.stage });

    const plants = await query.getMany();
    return plants.map(p => ({ ...p, isRemoved: false }));
  }

  async getSlotHistory(
    farmSlotId: string,
    filters?: ActivePlantsQueryDto,
  ): Promise<(SlotsPlantEntity & { isRemoved: boolean })[]> {
    const query = this.slotPlantRepo
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.plant', 'plant')
      .leftJoinAndSelect('sp.plantedByUser', 'user')
      .leftJoinAndSelect('sp.farmSlot', 'slot')
      .where('sp.farm_slot_id = :farmSlotId', { farmSlotId })
      .withDeleted()
      .orderBy('sp.deleted_at', 'ASC')
      .addOrderBy('sp.created_at', 'ASC');

    if (filters?.userId) query.andWhere('sp.planted_by = :userId', { userId: filters.userId });
    if (filters?.plantName)
      query.andWhere('sp.plant_name ILIKE :plantName', { plantName: `%${filters.plantName}%` });
    if (filters?.stage !== undefined) query.andWhere('sp.stage = :stage', { stage: filters.stage });

    const plants = await query.getMany();
    return plants.map(p => ({ ...p, isRemoved: !!p.deleted_at }));
  }
}
