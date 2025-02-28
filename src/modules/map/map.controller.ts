import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { MapService } from './map.service';
import { ClsService } from 'nestjs-cls';

@ApiBearerAuth()
@Controller('map')
@ApiTags('Map')
export class MapController {
  constructor(
    private readonly clsService: ClsService,
    private readonly mapService: MapService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(MapController.name);
  }

  @Get()
  @ApiOperation({
    summary: 'Get list all maps information',
  })
  async getAllMaps() {
    return await this.mapService.getAllMaps();
  }
}
