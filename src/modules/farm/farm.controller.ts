import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { FarmService } from './farm.service';
import { FarmEntity } from './entity/farm.entity';
import { FarmResponseDto, UpdateSlotDto } from './dto/farm.dto';

@ApiBearerAuth()
@ApiTags('Farms')
@Controller('farms')
export class FarmController {
  constructor(private readonly farmService: FarmService) {}

  @Get()
  @ApiOperation({
    summary: 'Get list of farms by clan_id',
  })
  async getFarmByClan(@Query('clan_id') clan_id: string): Promise<FarmEntity> {
    return this.farmService.getFarmByClan(clan_id);
  }

  @Patch(':farm_id')
  @ApiParam({
    name: 'farm_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiBody({ type: UpdateSlotDto })
  @ApiOperation({ summary: 'Update the number of slots in a farm' })
  async updateSlotFarm(
    @Param('farm_id') id: string,
    @Body() dto: UpdateSlotDto,
  ): Promise<FarmResponseDto> {
    return this.farmService.updateSlotFarm(id, dto);
  }
}
