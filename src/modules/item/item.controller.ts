import { Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { Public } from '@libs/decorator';
import { Body, Delete, Param, Put } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { UserService } from '../user/user.service';
import { ItemService } from './item.service';
import { ItemDtoRequest } from './dto/item.dto';

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
    summary: 'Get list all Items information',
  })
  async getAllItems() {
    return await this.itemService.getAllItems();
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new item',
  })
  @ApiBody({ type: ItemDtoRequest })
  async createItem(@Body() item: ItemDtoRequest) {
    return await this.itemService.createItem(item);
  }
}
