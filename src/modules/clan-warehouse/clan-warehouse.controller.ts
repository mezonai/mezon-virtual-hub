import { Controller, Get, Post, Body, Query, BadRequestException, Param} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiTags, ApiQuery} from '@nestjs/swagger';
import { CLanWarehouseService } from './clan-warehouse.service';
import { BuyPlantDto, SeedClanWarehouseDto } from './dto/clan-warehouse.dto';
import { UserEntity } from '@modules/user/entity/user.entity';
import { USER_TOKEN } from '@constant';
import { ClsService } from 'nestjs-cls';
import { RequireAdmin, RequireClanRoles } from '@libs/decorator';

@ApiBearerAuth()
@ApiTags('Clan Warehouse')
@Controller('Clan-Warehouses')
export class ClanWarehouseController {
  constructor(
    private readonly farmWarehouseService: CLanWarehouseService,
    private readonly cls: ClsService,
  ) {}

  @Get(':clan_id')
  @ApiOperation({ summary: 'Get all item in warehouse for a clan' })
  async getAllItemsInWarehouse(@Param('clan_id') clanId: string) {
    return this.farmWarehouseService.getAllItemsInWarehouse(clanId);
  }

  @Post('buy-items-clan')
  @RequireClanRoles('LEADER')
  @ApiOperation({ summary: 'Buy plant for a clan farm' })
  async buyItemsForClan(@Body() dto: BuyPlantDto) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.farmWarehouseService.buyItemsForClanFarm(user, dto);
  }

  @Post('seed-plant-to-warehouse')
  @RequireAdmin()
  @ApiOperation({ summary: 'Add item in warehouse for a clan' })
  async seedWarehouse(@Body() dto: SeedClanWarehouseDto) {
    return await this.farmWarehouseService.seedClanWarehouse(dto);
  }
}
