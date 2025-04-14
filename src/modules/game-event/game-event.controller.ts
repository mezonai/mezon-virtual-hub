import { USER_TOKEN } from '@constant';
import { AdminBypassGuard } from '@libs/guard/admin.guard';
import { Logger } from '@libs/logger';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { SaveEventGameDto } from './dto/game-event.dto';
import { GameEventService } from './game-event.service';

@ApiBearerAuth()
@ApiTags('Game Event')
@Controller('game-event')
export class GameEventController {
  constructor(
    private readonly cls: ClsService,
    private readonly gameEventService: GameEventService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(GameEventController.name);
  }

  @Get()
  @ApiOperation({
    summary: 'Get list event',
  })
  async findAll() {
    return await this.gameEventService.findAll();
  }

  @Get(':event_id')
  @ApiParam({
    name: 'event_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Get a specific event',
  })
  async findOneEvent(@Param('event_id', ParseUUIDPipe) event_id: string) {
    return await this.gameEventService.findOneWithCompletedUsers(event_id);
  }

  @Post()
  @UseGuards(AdminBypassGuard)
  @ApiOperation({
    summary: 'Create a new game event',
  })
  @ApiBody({ type: SaveEventGameDto })
  async createItem(@Body() payload: SaveEventGameDto) {
    return await this.gameEventService.saveEvent(payload);
  }

  @Put(':event_id')
  @UseGuards(AdminBypassGuard)
  @ApiParam({
    name: 'event_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Update a specific event',
  })
  @ApiBody({ type: SaveEventGameDto })
  async updateEvent(
    @Body() event: SaveEventGameDto,
    @Param('event_id', ParseUUIDPipe) event_id: string,
  ) {
    await this.gameEventService.saveEvent(event, event_id);
  }

  @Delete(':event_id')
  @UseGuards(AdminBypassGuard)
  @ApiParam({
    name: 'event_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Soft delete a specific event',
  })
  async deleteEvent(@Param('event_id', ParseUUIDPipe) event_id: string) {
    return await this.gameEventService.softDelete(event_id);
  }

  @Put(':event_id/complete')
  @ApiOperation({
    summary: 'Complete an event and add users to the completed list',
  })
  @ApiParam({
    name: 'event_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  async completeEvent(@Param('event_id', ParseUUIDPipe) event_id: string) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.gameEventService.completeEvent(event_id, user);
  }
}
