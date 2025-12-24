import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserClanStatService } from './user-clan-stat.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { UserEntity } from '@modules/user/entity/user.entity';
import { USER_TOKEN } from '@constant';
import { AddScoreDto } from '@modules/user-clan-stat/dto/user-clan-stat.dto';

@ApiBearerAuth()
@ApiTags('User Clan Stat')
@Controller('user-clan-stats')
export class UserClanStatController {
  constructor(
    private readonly userClantScoreService: UserClanStatService,
    private readonly cls: ClsService,
  ) {}

  @Post('add-score')
  async addScore(@Body() body: AddScoreDto) {
    const { userId, clanId, points, isLimited } = body;

    return this.userClantScoreService.addScore(
      userId,
      clanId,
      points,
      isLimited,
    );
  }

  @Get(':clanId/harvest-counts')
  @ApiOperation({
    summary: 'Get current harvest count information',
  })
  async getHarvestCounts(
    @Param('clanId') clanId: string,
  ) {
     const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.userClantScoreService.getHarvestCounts(user.id, clanId);
  }

  @Get('reset-weekly-manual')
  @ApiOperation({
    summary: 'Manually reset all players’ weekly scores',
    description:
      'Manually resets all players’ `weekly_score` values to 0. Useful for testing or emergency resets instead of waiting for the automatic weekly cron job.',
  })
  async resetWeeklyScores() {
    return this.userClantScoreService.resetWeeklyScores();
  }

  @Get('reset-daily-manual')
  @ApiOperation({
    summary: 'Manually reset daily harvest usage counts',
    description:
      'Resets `harvest_count_use` and `harvest_interrupt_count_use` to 0 for all users. Intended for manual testing or recovery purposes.',
  })
  async resetDailyHarverstCount() {
    return this.userClantScoreService.resetDailyHarvestCount();
  }
}
