import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantStageEntity } from './entity/plant-stage.entity';
import { PlantStageDto, PlantStageResponseDto, UpdatePlantStageDto } from './dto/plant-stage.dto';

@Injectable()
export class PlantStageService {
  constructor(
    @InjectRepository(PlantStageEntity)
    private readonly plantStageRepo: Repository<PlantStageEntity>,
  ) {}

  async getAllPlantStages(): Promise<PlantStageResponseDto[]> {
    const stages = await this.plantStageRepo.find({
      order: { plant_id: 'ASC', ratio_start: 'ASC' },
    });

    return stages.map((stage) => ({
      id: stage.id,
      plant_id: stage.plant_id,
      stage_name: stage.stage_name || '',
      ratio_start: stage.ratio_start,
      ratio_end: stage.ratio_end,
      description: stage.description,
    }));
  }

  async getPlantStagesByPlant(
    plant_id: string,
  ): Promise<PlantStageResponseDto[]> {
    const stages = await this.plantStageRepo.find({
      where: { plant_id },
      order: { ratio_start: 'ASC' },
    });

    return stages.map((stage) => ({
      id: stage.id,
      plant_id: stage.plant_id,
      stage_name: stage.stage_name || '',
      ratio_start: stage.ratio_start,
      ratio_end: stage.ratio_end,
      description: stage.description,
    }));
  }

  async createPlantStages(
    plant_id: string,
    dto: PlantStageResponseDto,
  ): Promise<PlantStageDto> {
    const newStage = this.plantStageRepo.create({
      plant_id,
      stage_name: dto.stage_name,
      ratio_start: dto.ratio_start,
      ratio_end: dto.ratio_end,
      description: dto.description,
    });

    const saved = await this.plantStageRepo.save(newStage);
    return {
      plant_id,
      stage_name: saved.stage_name || '',
      ratio_start: saved.ratio_start,
      ratio_end: saved.ratio_end,
      description: saved.description,
    };
  }

  async updatePlantStages(
    id: string,
    dto: UpdatePlantStageDto,
  ): Promise<PlantStageEntity> {
    const stage = await this.plantStageRepo.findOne({ where: { id } });
    if (!stage) throw new NotFoundException('Plant stage not found');

    Object.assign(stage, dto);
    return this.plantStageRepo.save(stage);
  }

  async deleteStage(id: string): Promise<{ message: string }> {
    const stage = await this.plantStageRepo.findOne({ where: { id } });
    if (!stage) throw new NotFoundException('Plant stage not found');

    await this.plantStageRepo.remove(stage);

    return { message: 'Plant stage deleted successfully' };
  }
}
