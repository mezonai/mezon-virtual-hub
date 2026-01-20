import { USER_TOKEN } from '@constant';
import { InventoryType, ItemType } from '@enum';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { BuyRequestQuery } from './dto/inventory.dto';
import { InventoryService } from './inventory.service';

@ApiBearerAuth()
@Controller('inventory')
@ApiTags('Inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly cls: ClsService,
  ) {}

  @Post('buy/:id')
  @ApiOperation({
    summary: 'Buy food or item by ID',
  })
  @ApiParam({
    name: 'id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
    description: 'UUID of the item or food to buy',
  })
  @ApiQuery({
    name: 'type',
    enum: InventoryType,
    required: false,
    description: 'Type of inventory to buy (item or food)',
    default: InventoryType.ITEM,
  })
  async buyFoodOrItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() { type, quantity }: BuyRequestQuery,
  ) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);

    if (type === InventoryType.FOOD) {
      return this.inventoryService.buyFood(user.id, id, quantity);
    }

    return this.inventoryService.buyItem(user.id, id, quantity);
  }

  @Get('food')
  @ApiOperation({
    summary: 'Get all Foods of user information',
  })
  async getAllFoodsOfUser() {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return await this.inventoryService.getAllFoodsOfUser(user);
  }

  @Get('item')
  @ApiOperation({
    summary: 'Get all Items of user information',
  })
  async getAllItemsOfUser() {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return await this.inventoryService.getAllItemsOfUser(user);
  }

  @Get('item-type/:type')
  @ApiParam({
    name: 'type',
    enum: ItemType,
    description: 'Type of Item (must be one of ItemType enum values)',
  })
  @ApiOperation({
    summary: 'Get items of user with specific item type',
  })
  async getItemsByType(
    @Param('type', new ParseEnumPipe(ItemType)) type: ItemType,
  ) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return await this.inventoryService.getItemsByType(user, type);
  }

  @Get('item-fragment/:species')
  @ApiParam({
    name: 'species',
    description: 'Species of the pet fragment to filter items',
  })
  @ApiOperation({
    summary: 'Get items of user with specific pet fragment species',
  })
  async getListFragmentItemsBySpecies(
    @Param('species') species: string,
  ) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return await this.inventoryService.getListFragmentItemsBySpecies(user, species);
  }
}
