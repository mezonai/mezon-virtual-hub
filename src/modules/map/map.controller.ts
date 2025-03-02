import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { Public } from '@libs/decorator';
import { MapService } from './map.service';
import { UserService } from '../user/user.service';
import { ClsService } from 'nestjs-cls';
import { Body, Delete, Param, Post, Put } from '@nestjs/common';
import { CreateMapDto, UpdateMapDto } from './dto/map.dto';

@ApiBearerAuth()
@Controller('maps')
@ApiTags('Map')
export class MapController {
  constructor(
    private readonly clsService: ClsService,
    private readonly mapService: MapService,
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(MapController.name);
  }

  @Get('')
  @Public()
  @ApiOperation({
    summary: 'Get list all maps information',
  })
  async getAllMaps() {
    return await this.mapService.getAllMaps();
  }

  @Get('/:id')
  @Public()
  @ApiOperation({
    summary: 'Get map details by id',
  })
  async getMapById(@Param('id') id: string) {
    return await this.mapService.getMapById(id);
  }

  // @Post('')
  // @ApiOperation({
  //   summary: 'Create a new map',
  // })
  // async createMap(@Body() createMapDto: CreateMapDto) {
  //   return await this.mapService.createMap(createMapDto);
  // }

  @Put('/:id')
  @ApiOperation({
    summary: 'Update an existing map',
  })
  async updateMap(@Param('id') id: string, @Body() updateMapDto: UpdateMapDto) {
    return await this.mapService.updateMap(id, updateMapDto);
  }

  @Delete('/:id')
  @ApiOperation({
    summary: 'Delete a map',
  })
  async deleteMap(@Param('id') id: string) {
    return await this.mapService.deleteMap(id);
  }

  @Get('/:id/users')
  @Public()
  @ApiOperation({
    summary: 'Get all users from a map',
  })
  async getUsersFromMap(@Param('id') id: string) {
    return await this.userService.getUsersByMapId(id);
  }
}
