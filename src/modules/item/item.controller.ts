import { Controller, Get, ParseUUIDPipe, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { RequireAdmin } from '@libs/decorator';
import { Body, Delete, Param, Put } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { UserService } from '../user/user.service';
import { ItemDtoRequest } from './dto/item.dto';
import { ItemService } from './item.service';

@ApiBearerAuth()
@Controller('item')
@ApiTags('Item')
export class ItemController {
  constructor(
    private readonly clsService: ClsService,
    private readonly itemService: ItemService,
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ItemController.name);
  }

  @Get()
  @ApiOperation({
    summary: 'Get list all Items information purchasable',
  })
  async getAllItemsPurchasable() {
    return await this.itemService.getAllItemsPurchasable();
  }

  @Get('all-item')
  @ApiOperation({
    summary: 'Get list all Items',
  })
  async getAllItems() {
    return await this.itemService.getAllItems();
  }

  @Post()
  @RequireAdmin()
  @ApiOperation({
    summary: 'Create a new item',
  })
  @ApiBody({ type: ItemDtoRequest })
  async createItem(@Body() item: ItemDtoRequest) {
    return await this.itemService.createItem(item);
  }

  @Put(':item_id')
  @RequireAdmin()
  @ApiParam({
    name: 'item_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Update a specific item',
  })
  @ApiBody({ type: ItemDtoRequest })
  async updateItem(
    @Body() item: ItemDtoRequest,
    @Param('item_id', ParseUUIDPipe) item_id: string,
  ) {
    return await this.itemService.updateItem(item, item_id);
  }

  @Delete(':item_id')
  @RequireAdmin()
  @ApiParam({
    name: 'item_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Soft delete a specific item',
  })
  async deleteItem(@Param('item_id', ParseUUIDPipe) item_id: string) {
    return await this.itemService.deleteItem(item_id);
  }
}
