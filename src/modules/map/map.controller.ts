import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RequireAdmin } from '@libs/decorator';
import { MapService } from './map.service';
import {
  CreateMapDto,
  UpdateMapDto,
} from './dto/map.dto';

@ApiBearerAuth()
@ApiTags('Map')
@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get()
  @ApiOperation({ summary: 'Get all maps' })
  getAllMaps() {
    return this.mapService.getAllMaps();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get map by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  getMapById(@Param('id') id: string) {
    return this.mapService.getMapById(id);
  }

  @Post()
  @RequireAdmin()
  @ApiOperation({ summary: 'Create map' })
  createMap(@Body() dto: CreateMapDto) {
    return this.mapService.createMap(dto);
  }

  @Patch(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Update map' })
  updateMap(
    @Param('id') id: string,
    @Body() dto: UpdateMapDto,
  ) {
    return this.mapService.updateMap(id, dto);
  }

  @Delete(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Delete map' })
  deleteMap(@Param('id') id: string) {
    return this.mapService.deleteMap(id);
  }
}
