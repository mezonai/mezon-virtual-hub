import { Controller, Get, Post, Body, Query, BadRequestException, Param, ParseUUIDPipe} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiTags, ApiQuery} from '@nestjs/swagger';
import { CLanWarehouseService } from './clan-warehouse.service';
import { AddItemDto, BuyItemDto, GetAllItemsInWarehouseQueryDto, SeedClanWarehouseDto } from './dto/clan-warehouse.dto';
import { UserEntity } from '@modules/user/entity/user.entity';
import { USER_TOKEN } from '@constant';
import { ClsService } from 'nestjs-cls';
import { RequireAdmin } from '@libs/decorator';
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
    @Query() query: GetAllItemsInWarehouseQueryDto
  ) {
    return this.farmWarehouseService.getAllItemsInWarehouse(clanId, query);
  }

  @Post('add-item-to-warehouse')
  @RequireAdmin()
  @ApiOperation({ summary: 'Add item to clan warehouse' })
  async addItemToWarehouse(
    @Param('clan_id', ParseUUIDPipe) clanId: string,
    @Query() dto: AddItemDto,
  ) {
    return this.farmWarehouseService.addItemToClanWarehouse(clanId, dto.itemId, dto.quantity);
  }

  @Post('buy-items-clan')
  @ApiOperation({ summary: 'Buy plant for a clan farm' })
  async buyItemsForClan(@Body() dto: BuyItemDto) {
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
