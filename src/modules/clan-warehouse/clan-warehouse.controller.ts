import { Controller, Get, Post, Body, Query, BadRequestException, Param, ParseUUIDPipe} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiTags, ApiQuery} from '@nestjs/swagger';
import { CLanWarehouseService } from './clan-warehouse.service';
import { BuyPlantDto, SeedClanWarehouseDto } from './dto/clan-warehouse.dto';
import { UserEntity } from '@modules/user/entity/user.entity';
import { USER_TOKEN } from '@constant';
import { ClsService } from 'nestjs-cls';
import { RequireAdmin, RequireClanRoles } from '@libs/decorator';
import { UUID } from 'crypto';

@ApiBearerAuth()
@ApiTags('Clan Warehouse')
@Controller('clans/:clan_id/Clan-Warehouses')
export class ClanWarehouseController {
  constructor(
    private readonly farmWarehouseService: CLanWarehouseService,
    private readonly cls: ClsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all item in warehouse for a clan' })
  async getAllItemsInWarehouse(
    @Param('clan_id', ParseUUIDPipe) clanId: string,
  ) {
    return this.farmWarehouseService.getAllItemsInWarehouse(clanId);
  }

  @Get('items-for-planting')
  @ApiOperation({ summary: 'Get all item for planting' })
  async getItemsForPlanting(
    @Param('clan_id', ParseUUIDPipe)clanId: string,
  ) {
    return this.farmWarehouseService.getItemsForPlant(clanId);
  }

  @Post('buy-items-clan')
  @ApiOperation({ summary: 'Buy plant for a clan farm' })
  async buyItemsForClan(@Body() dto: BuyPlantDto) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.farmWarehouseService.buyItemsForClanFarm(user, dto);
  }

  @Post('seed-plant-to-warehouse')
  @RequireAdmin()
  @ApiOperation({ summary: 'Add item in warehouse for a clan' })
  async seedWarehouse(
    @Param('clan_id', ParseUUIDPipe) clanId: string,
    @Body() dto: SeedClanWarehouseDto,
  ) {
    return await this.farmWarehouseService.seedClanWarehouse(clanId, dto);
  }
}
