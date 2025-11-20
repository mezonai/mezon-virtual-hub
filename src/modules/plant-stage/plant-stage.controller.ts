import {Body, Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import { PlantStageService } from './plant-stage.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import {
  PlantStageResponseDto,
  UpdatePlantStageDto,
} from './dto/plant-stage.dto';
import { RequireAdmin } from '@libs/decorator';

@ApiBearerAuth()
@ApiTags('Plant Stage')
@Controller('plant-stage')
export class PlantStageController {
  constructor(
    private readonly plantStageService: PlantStageService,
    private readonly clsService: ClsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all plant stage',
  })
  async getAllPlantStages(): Promise<PlantStageResponseDto[]> {
    return this.plantStageService.getAllPlantStages();
  }

  @Get(':plant_id')
  @ApiOperation({
    summary: 'Get plant stage  by Plant id',
  })
  async getStages(
    @Param('plant_id') plantId: string,
  ): Promise<PlantStageResponseDto[]> {
    return await this.plantStageService.getPlantStagesByPlant(plantId);
  }

  @Post(':plantId')
  @RequireAdmin()
  @ApiOperation({
    summary: 'Create plant stage  by id',
  })
  async createStage(
    @Param('plantId') plantId: string,
    @Body() dto: PlantStageResponseDto,
  ): Promise<PlantStageResponseDto> {
    return this.plantStageService.createPlantStages(plantId, dto);
  }

  @Patch(':plant_stage_id')
  @ApiOperation({
    summary: 'Update plant stage  by id',
  })
  async updateStage(
    @Param('plant_stage_id') plantStageId: string,
    @Body() dto: UpdatePlantStageDto,
  ): Promise<PlantStageResponseDto> {
    return this.plantStageService.updatePlantStages(plantStageId, dto);
  }

  @Delete(':plant_stage_id')
  @RequireAdmin()
  @ApiOperation({
    summary: 'Delete plant stage  by id',
  })
  async deleteStage(
    @Param('plant_stage_id') plantStageId: string,
  ): Promise<{ message: string }> {
    return this.plantStageService.deleteStage(plantStageId);
  }
}
