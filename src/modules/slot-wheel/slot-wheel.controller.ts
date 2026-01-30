import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SlotWheelService } from './slot-wheel.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequireAdmin } from '@libs/decorator';
import { CreateSlotWheelDto, SlotWheelQueryDto, SpinQueryDto, UpdateSlotWheelDto } from '@modules/slot-wheel/dto/slot-wheel.dto';
import { ClsService } from 'nestjs-cls';
import { UserEntity } from '@modules/user/entity/user.entity';
import { USER_TOKEN } from '@constant';

@ApiTags('Slot Wheel')
@Controller('slot-wheel')
@ApiBearerAuth()
export class SlotWheelController {
  constructor(
    private readonly slotWheelService: SlotWheelService,
    private readonly cls: ClsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new slot wheel item',
  })
  @RequireAdmin()
  createSlotWheelItem(@Query() body: CreateSlotWheelDto) {
    return this.slotWheelService.createSlotWheelItem(body);
  }

  @Get()
  @ApiOperation({
    summary: 'Get list all slot wheel items',
  })
  getAll(@Query() query: SlotWheelQueryDto) {
    return this.slotWheelService.getAll(query);
  }

  @Get('spin')
  @ApiOperation({ summary: 'Spin a wheel' })
  getRandom(@Query() query: SpinQueryDto) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.slotWheelService.spinWheel(user, query.wheel_id, query.quantity);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a slot wheel item',
  })
  @RequireAdmin()
  updateSlotWheelItem(@Param('id') id: string, @Body() updateSlotWheelDto: UpdateSlotWheelDto) {
    return this.slotWheelService.updateSlotWheelItem(id, updateSlotWheelDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a slot wheel item',
  })
  @RequireAdmin()
  deleteSlotWheelItem(@Param('id') id: string) {
    return this.slotWheelService.deleteSlotWheelItem(id);
  }
}
