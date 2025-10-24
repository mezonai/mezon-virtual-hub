import {Controller, Get, Post, Patch, Delete, Param, Body} from '@nestjs/common';
import { PlantService } from './plant.service';
import { PlantEntity } from './entity/plant.entity';
import { RequireAdmin } from '@libs/decorator';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreatePlantDto } from './dto/plant.dto';

@ApiBearerAuth()
@Controller('plants')
export class PlantController {
  constructor(private readonly plantService: PlantService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all plant',
  })
  async getAll(): Promise<PlantEntity[]> {
    return this.plantService.getAllPlants();
  }

  @Get(':plant_id')
  @ApiOperation({
    summary: 'Get plant  by plant_id',
  })
  async getOne(@Param('plant_id') plantId: string): Promise<PlantEntity> {
    return this.plantService.getPlantById(plantId);
  }

  @Post()
  @RequireAdmin()
  @ApiOperation({
    summary: 'Create plant  by plant_id',
  })
  async create(@Body() plantDto: CreatePlantDto): Promise<PlantEntity> {
    return this.plantService.createPlant(plantDto);
  }

  @Patch(':plant_id')
  @ApiOperation({
    summary: 'Update plant by plant_id',
  })
  async update(
    @Param('plant_id') plantId: string,
    @Body() plantDto: Partial<PlantEntity>,
  ): Promise<PlantEntity> {
    return this.plantService.updatePlantById(plantId, plantDto);
  }

  @Delete(':plant_id')
  @RequireAdmin()
  @ApiOperation({
    summary: 'Delete plant by plant_id',
  })
  async delete(
    @Param('plant_id') plantId: string,
  ): Promise<{ deleted: boolean }> {
    return this.plantService.deletePlantById(plantId);
  }
}
