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
import { MapDecorConfigService } from './map-decor-config.service';
import {
  CreateMapDecorConfigDto,
  MapDecorConfigQueryDto,
} from './dto/map-decor-config.dto';
import { RequireAdmin } from '@libs/decorator';

@ApiBearerAuth()
@ApiTags('Map Decor Config')
@Controller('map-decor-config')
export class MapDecorConfigController {
  constructor(
    private readonly configService: MapDecorConfigService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all map decor configs',
  })
  getAll(@Query() query: MapDecorConfigQueryDto) {
    return this.configService.getAllMapDecorConfigs(
      query,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get map decor config by id',
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  getById(@Param('id') id: string) {
    return this.configService.getMapDecorConfigById(
      id,
    );
  }

  @Post()
  @RequireAdmin()
  @ApiOperation({
    summary: 'Place or replace decor item to placeholder',
  })
  placeDecor(
    @Body() dto: CreateMapDecorConfigDto,
  ) {
    return this.configService.placeDecorItemToPlaceholder(
      dto,
    );
  }

  @Delete(':id')
  @RequireAdmin()
  @ApiOperation({
    summary: 'Remove decor from placeholder',
  })
  removeDecor(@Param('id') id: string) {
    return this.configService.removeDecorFromPlaceholder(
      id,
    );
  }
}
