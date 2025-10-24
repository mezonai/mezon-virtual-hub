import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { FarmSlotService } from './farm-slots.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { PlantOnSlotDto } from './dto/farm-slot.dto';
import { USER_TOKEN } from '@constant';
import { UserEntity } from '@modules/user/entity/user.entity';

@ApiBearerAuth()
@ApiTags('FarmSlots')
@Controller('farm-slots')
export class FarmSlotsController {
  constructor(
    private readonly farmSlotsService: FarmSlotService,
    private readonly clsService: ClsService,
  ) {}

  @Get(':clan_id')
  @ApiOperation({ summary: 'Get farm slot by clan Id' })
  async getFarmByClan(@Param('clan_id') clan_id: string) {
    return this.farmSlotsService.getFarmWithSlotsByClan(clan_id);
  }

  @Get(':farm_id')
  @ApiOperation({ summary: 'Get farm slot by farm Id' })
  async getFarmById(@Param('farm_id') farm_id: string) {
    return this.farmSlotsService.getFarmWithSlotsByFarm(farm_id);
  }

  @Post(':plant')
  @ApiOperation({ summary: 'Plant a crop on a farm slot' })
  async plant(@Body() dto: PlantOnSlotDto) {
    const user = this.clsService.get<UserEntity>(USER_TOKEN);
    return this.farmSlotsService.plantToSlot(user.id, dto);
  }

  @Patch(':farm_slot_id/harvest')
  @ApiOperation({ summary: 'Harvest a plant on a slot' })
  async harvest(@Param('farm_slot_id') farmSlotId: string) {
    const user = this.clsService.get<UserEntity>(USER_TOKEN);
    return this.farmSlotsService.harvestPlant(user.id, farmSlotId);
  }

  @Post(':farm_slot_id/water')
  @ApiOperation({ summary: 'Water a plant on a slot' })
  async waterPlant(@Param('farm_slot_id') farmSlotId: string) {
    const user = this.clsService.get<UserEntity>(USER_TOKEN);
    return this.farmSlotsService.waterPlant(user.id, farmSlotId);
  }

  @Post(':farm_slot_id/catchbug')
  @ApiOperation({ summary: 'Cach bug a plant on a slot' })
  async catchBug(@Param('farm_slot_id') farmSlotId: string) {
    const user = this.clsService.get<UserEntity>(USER_TOKEN);
    return this.farmSlotsService.catchBug(user.id, farmSlotId);
  }
}
