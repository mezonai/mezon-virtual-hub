import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequireAdmin } from '@libs/decorator';
import { WheelService } from './wheel.service';
import {
  CreateWheelDto,
  UpdateWheelDto,
  WheelQueryDto,
} from './dto/wheel.dto';

@ApiTags('Wheel')
@ApiBearerAuth()
@Controller('wheel')
export class WheelController {
  constructor(private readonly wheelService: WheelService) {}

  @Post()
  @RequireAdmin()
  @ApiOperation({ summary: 'Create a new wheel' })
  create(@Body() dto: CreateWheelDto) {
    return this.wheelService.createWheel(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all wheels' })
  getAllWheels(@Query() query: WheelQueryDto) {
    return this.wheelService.getAllWheels(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get wheel detail' })
  getWheelById(@Param('id') id: string) {
    return this.wheelService.getWheelById(id);
  }

  @Patch(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Update wheel' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWheelDto,
  ) {
    return this.wheelService.updateWheel(id, dto);
  }

  @Delete(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Delete wheel' })
  delete(@Param('id') id: string) {
    return this.wheelService.deleteWheel(id);
  }
}
