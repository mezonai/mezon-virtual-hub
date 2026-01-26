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
import {
  CreateClanDecorInventoryDto,
  ClanDecorInventoryQueryDto,
} from './dto/clan-decor-inventory.dto';
import { RequireAdmin } from '@libs/decorator';

@ApiBearerAuth()
@ApiTags('Clan Decor Inventory')
@Controller('clan-decor-inventory')
export class ClanDecorInventoryController {
  constructor(
    private readonly inventoryService: ClanDecorInventoryService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all clan decor inventories',
  })
  getAll(@Query() query: ClanDecorInventoryQueryDto) {
    return this.inventoryService.getAllClanDecorInventories(
      query,
    );
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
    return this.inventoryService.getClanDecorInventoryById(
      id,
    );
  }

  @Post()
  @RequireAdmin()
  @ApiOperation({
    summary: 'Add decor item to clan inventory',
  })
  addDecorItem(
    @Body() dto: CreateClanDecorInventoryDto,
  ) {
    return this.inventoryService.addDecorItemToClan(
      dto,
    );
  }

  @Delete(':id')
  @RequireAdmin()
  @ApiOperation({
    summary: 'Remove decor item from clan inventory',
  })
  removeDecorItem(@Param('id') id: string) {
    return this.inventoryService.removeDecorItemFromClan(
      id,
    );
  }
}
