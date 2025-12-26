// player-quest.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  Body,
  Query,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { PlayerQuestService } from './player-quest.service';
import { PlayerQuestEntity } from './entity/player-quest.entity';
import { USER_TOKEN } from '@constant';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  FinishQuestQueryDto,
  PlayerQuestQueryDto,
  PlayerQuestsResponseDto,
  QueryPlayerQuestDto,
  UpdatePlayerQuestDto,
} from './dto/player-quest.dto';
import { RequireAdmin } from '@libs/decorator';
import { QueryParamsDto } from '@types';

@ApiTags('Player Quests')
@Controller('player-quests')
@ApiBearerAuth()
export class PlayerQuestController {
  constructor(
    private readonly playerQuestService: PlayerQuestService,
    private readonly cls: ClsService,
  ) {}

  @Get()
  @ApiOkResponse({
    description: 'Get player quests grouped by daily and weekly',
    type: PlayerQuestsResponseDto,
  })
  async getPlayerQuests() {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.playerQuestService.getPlayerQuests(user.id);
  }

  @Get('get-all-player-quest')
  @RequireAdmin()
  @ApiOperation({
    summary: 'Get list all quest information',
  })
  async getAllPlayerQuests(@Query() query: QueryPlayerQuestDto) {
    return await this.playerQuestService.getAllPlayerQuests(query);
  }

  @Get('get-quests-frequency')
  @ApiOperation({ summary: 'get Player Quests By Frequency' })
  async getPlayerQuestsByFrequency(@Query() query: PlayerQuestQueryDto) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.playerQuestService.getPlayerQuestsByFrequency(user.id, query);
  }

  @Get('newbie-login')
  @ApiOperation({ summary: 'Get player quests by login' })
  async getLoginReward(@Query() query: PlayerQuestQueryDto) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.playerQuestService.getNewbieLoginQuests(user.id, query);
  }

  @Get('login-event-7-days')
  async getLoginRewardQuest(@Query() query: PlayerQuestQueryDto) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.playerQuestService.getLoginRewardQuest(user.id);
  }

  @Get('check-unclaimed-quest')
  @ApiOperation({ summary: 'Check-Unclaimed-Quest' })
  async checkUnclaimedQuest() {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.playerQuestService.checkUnclaimedQuest(user.id);
  }

  @Put(':player_quest_id/finish-quest')
  @ApiOperation({ summary: 'Finish quest player' })
  async finishQuest(
    @Param('player_quest_id') player_quest_id: string,
  ): Promise<PlayerQuestEntity> {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.playerQuestService.finishQuest(user, player_quest_id);
  }

  @Put('update-quest-player')
  @RequireAdmin()
  @ApiOperation({ summary: 'Update quest player' })
  async updateQuest(@Body() dto: UpdatePlayerQuestDto) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.playerQuestService.updatePlayerQuest(
      user.id,
      dto.quest_id,
      dto,
    );
  }

  @Delete('delete-login-quests')
  @RequireAdmin()
  @ApiOperation({ summary: 'Delete all login quests for player' })
  async deleteLoginQuests(): Promise<{ success: boolean; message: string }> {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    await this.playerQuestService.deleteLoginQuests(user.id);
    return { success: true, message: 'Deleted all login quests' };
  }
}
