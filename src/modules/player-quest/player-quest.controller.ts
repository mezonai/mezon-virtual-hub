import { USER_TOKEN } from '@constant';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { PlayerQuestsResponseDto } from './dto/player-quest.dto';
import { PlayerQuestService } from './player-quest.service';

@ApiTags('Player Quest')
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
  async getPlayerQuests(): Promise<PlayerQuestsResponseDto> {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.playerQuestService.getPlayerQuests(user.id);
  }

  @Get('login')
  async getLoginReward() {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.playerQuestService.getLoginQuest(user.id);
  }
}
