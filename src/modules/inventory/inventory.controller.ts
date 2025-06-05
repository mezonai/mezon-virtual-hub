import { USER_TOKEN } from '@constant';
import { UserEntity } from '@modules/user/entity/user.entity';
import { BadRequestException, Controller, DefaultValuePipe, Get, Param, ParseEnumPipe, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { InventoryService } from './inventory.service';
import { FoodService } from '@modules/food/food.service';
import { InventoryType } from '@enum';
import { BuyRequestQuery } from './dto/inventory.dto';

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
    default: InventoryType.ITEM
  })
  async buyFoodOrItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() { type, quantity }: BuyRequestQuery,
  ) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);

    if (type === InventoryType.FOOD) {
      return this.inventoryService.buyFood(user, id, quantity);
    }

    return this.inventoryService.buyItem(user, id, quantity);
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
}
