import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantEntity } from './entity/plant.entity';
import { CreatePlantDto } from './dto/plant.dto';

@Injectable()
export class PlantService {
  constructor(
    @InjectRepository(PlantEntity)
    private readonly plantRepository: Repository<PlantEntity>,
  ) {}

  async getAllPlants(): Promise<PlantEntity[]> {
    return this.plantRepository.find({
      relations: ['slotPlants'],
      order: { name: 'ASC' },
    });
  }

  async getPlantById(id: string): Promise<PlantEntity> {
    const plant = await this.plantRepository.findOne({
      where: { id },
      relations: ['slotPlants'],
    });
    if (!plant) throw new NotFoundException('Plant not found');
    return plant;
  }

  async createPlant(dto:CreatePlantDto): Promise<PlantEntity> {
    const plant = this.plantRepository.create(dto);
    return this.plantRepository.save(plant);
  }

  async updatePlantById(
    id: string,
    dto: Partial<PlantEntity>,
  ): Promise<PlantEntity> {
    const plant = await this.getPlantById(id);
    Object.assign(plant, dto);

    return this.plantRepository.save(plant);
  }

  async deletePlantById(id: string): Promise<{ deleted: boolean }> {
    const result = await this.plantRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Plant not found');
    return { deleted: true };
  }
}
