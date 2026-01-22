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
@RequireAdmin()
@Controller('wheel')
export class WheelController {
  constructor(private readonly wheelService: WheelService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new wheel' })
  create(@Body() dto: CreateWheelDto) {
    return this.wheelService.createWheel(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all wheels' })
  getAll(@Query() query: WheelQueryDto) {
    return this.wheelService.getAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get wheel detail' })
  getById(@Param('id') id: string) {
    return this.wheelService.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update wheel' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWheelDto,
  ) {
    return this.wheelService.updateWheel(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete wheel' })
  delete(@Param('id') id: string) {
    return this.wheelService.deleteWheel(id);
  }
}
