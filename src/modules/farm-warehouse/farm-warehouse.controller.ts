import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { FarmWarehouseService } from './farm-warehouse.service';
import { BuyPlantDto } from './dto/farm-warehouse.dto';
import { UserEntity } from '@modules/user/entity/user.entity';
import { USER_TOKEN } from '@constant';
import { ClsService } from 'nestjs-cls';
import { RequireClanRoles } from '@libs/decorator';

@ApiBearerAuth()
@ApiTags('FarmWarehouse')
@Controller('farm-warehouses')
export class FarmWarehouseController {
  constructor(
    private readonly farmWarehouseService: FarmWarehouseService,
    private readonly cls: ClsService,
  ) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all plants in warehouse for a farm' })
  @ApiQuery({ name: 'farmId', description: 'ID of the farm', required: true })
  async getAllPlantsInWarehouse(@Query('farmId') farmId: string) {
    if (!farmId) throw new BadRequestException('Missing farmId');
    return this.farmWarehouseService.getAllPlantsInWarehouse(farmId);
  }

  @Post('buy')
  @RequireClanRoles('LEADER')
  @ApiOperation({ summary: 'Buy plant for a clan farm' })
  async buyPlantForClan(@Body() dto: BuyPlantDto) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.farmWarehouseService.buyPlantForClanFarm(user, dto);
  }

}
