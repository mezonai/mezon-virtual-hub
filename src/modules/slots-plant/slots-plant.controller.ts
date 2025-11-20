import { Controller, Get, Param } from '@nestjs/common';
import { SlotsPlantService } from './slots-plant.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';

@ApiBearerAuth()
@ApiTags('Slots Plant')
@Controller('slots-plant')
export class SlotsPlantController {
  constructor(
    private readonly slotsPlantService: SlotsPlantService,
    private readonly clsService: ClsService,
  ) { }

  @Get(':farm_slot_id/history')
  @ApiOperation({ summary: 'Get all history of a slot' })
  getHistory(@Param('farm_slot_id') farmSlotId: string) {
    return this.slotsPlantService.getSlotHistory(farmSlotId);
  }

  @Get(':farm_slot_id/harvesters')
  @ApiOperation({ summary: 'Get all harvesters for a slot' })
  getHarvesters(@Param('farm_slot_id') farmSlotId: string) {
    return this.slotsPlantService.getSlotHarvesters(farmSlotId);
  }

  @Get(':farm_slot_id/actions')
  @ApiOperation({ summary: 'Get all actions on a slot' })
  getActions(@Param('farm_slot_id') farmSlotId: string) {
    return this.slotsPlantService.getSlotActions(farmSlotId);
  }

  @Get(':farm_slot_id/score')
  @ApiOperation({ summary: 'Get slot score' })
  getSlotScore(@Param('farm_slot_id') farmSlotId: string) {
    return this.slotsPlantService.getSlotScore(farmSlotId);
  }

  @Get('/farm/:farm_id/score')
  @ApiOperation({ summary: 'Get total score for a farm (per clan)' })
  getFarmScore(@Param('farm_id') farmId: string) {
    return this.slotsPlantService.getFarmScore(farmId);
  }

}
