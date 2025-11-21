import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { SlotsPlantService } from './slots-plant.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { UserEntity } from '@modules/user/entity/user.entity';
import { USER_TOKEN } from '@constant';
import { PlantState } from '@enum';
import { ActivePlantsQueryDto } from './dto/slots-plant.dto';

@ApiBearerAuth()
@ApiTags('Slots Plant')
@Controller('slots-plant')
export class SlotsPlantController {
  constructor(
    private readonly slotsPlantService: SlotsPlantService,
    private readonly cls: ClsService,
  ) {}

  @Get('')
  @ApiOperation({ summary: 'Get all slot plants (including deleted)' })
  async getAllSlotPlants() {
    return this.slotsPlantService.getAllSlotPlants();
  }

 @Get(':farmSlotId/active')
  @ApiOperation({ summary: 'Get active plants in a slot' })
  async getActivePlants(
    @Param('farmSlotId') farmSlotId: string,
    @Query() query: ActivePlantsQueryDto,
  ) {
    return this.slotsPlantService.getActivePlantsInSlot(farmSlotId, query);
  }

  @Get(':farmSlotId/history')
  @ApiOperation({ summary: 'Get slot history (including removed plants)' })
  async getSlotHistory(
    @Param('farmSlotId') farmSlotId: string,
    @Query() query: ActivePlantsQueryDto,
  ) {
    return this.slotsPlantService.getSlotHistory(farmSlotId, query);
  }
}
