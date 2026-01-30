import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ClanDecorInventoryService } from './clan-decor-inventory.service';
import { ClanDecorInventoryQueryDto } from './dto/clan-decor-inventory.dto';
import { RequireAdmin } from '@libs/decorator';
import { UserEntity } from '@modules/user/entity/user.entity';
import { USER_TOKEN } from '@constant';
import { ClsService } from 'nestjs-cls';

@ApiBearerAuth()
@ApiTags('Clan Decor Inventory')
@Controller('clan-decor-inventory')
export class ClanDecorInventoryController {
  constructor(
    private readonly inventoryService: ClanDecorInventoryService,
    private readonly cls: ClsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all clan decor inventories',
  })
  getAll(@Query() query: ClanDecorInventoryQueryDto) {
    return this.inventoryService.getAllClanDecorInventories(query);
  }

  @Post('buy-decor-item/:recipeId')
  @ApiOperation({
    summary: 'Buy decor item for clan',
  })
    @ApiParam({
    name: 'recipeId',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  buyDecorItemForClan(@Param('recipeId') recipeId: string) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.inventoryService.buyDecorItemForClan(user, recipeId);
  }

  
  @Get(':id')
  @ApiOperation({
    summary: 'Get clan decor inventory by id',
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  getById(@Param('id') id: string) {
    return this.inventoryService.getClanDecorInventoryById(id);
  }

  @Delete(':id')
  @RequireAdmin()
  @ApiOperation({
    summary: 'Remove decor item from clan inventory',
  })
  removeDecorItem(@Param('id') id: string) {
    return this.inventoryService.removeDecorItemFromClan(id);
  }
}
