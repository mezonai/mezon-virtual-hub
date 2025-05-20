import { Controller, Get, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { AdminBypassGuard } from '@libs/guard/admin.guard';
import { Body, Delete, Param, Put } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { UserService } from '../user/user.service';
import { FoodDtoRequest } from './dto/food.dto';
import { FoodService } from './food.service';

@ApiBearerAuth()
@Controller('food')
@ApiTags('Food')
export class FoodController {
  constructor(
    private readonly clsService: ClsService,
    private readonly foodService: FoodService,
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(FoodController.name);
  }

  @Get()
  @ApiOperation({
    summary: 'Get list all Foods information',
  })
  async getAllFoods() {
    return await this.foodService.getAllFoods();
  }

  @Post()
  @UseGuards(AdminBypassGuard)
  @ApiOperation({
    summary: 'Create a new food',
  })
  async createFood(@Query() food: FoodDtoRequest) {
    return await this.foodService.createFood(food);
  }

  @Put(':food_id')
  @UseGuards(AdminBypassGuard)
  @ApiParam({
    name: 'food_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Update a specific food',
  })
  async updateFood(
    @Query() food: FoodDtoRequest,
    @Param('food_id', ParseUUIDPipe) food_id: string,
  ) {
    return await this.foodService.updateFood(food, food_id);
  }

  @Delete(':food_id')
  @UseGuards(AdminBypassGuard)
  @ApiParam({
    name: 'food_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Soft delete a specific food',
  })
  async deleteFood(@Param('food_id', ParseUUIDPipe) food_id: string) {
    return await this.foodService.deleteFood(food_id);
  }
}
