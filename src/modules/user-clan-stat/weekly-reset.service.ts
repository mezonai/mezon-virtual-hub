import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UserClanStatService } from './user-clan-stat.service';
import { RewardManagementService } from '@modules/admin/reward/reward.service';
import { ClanService } from '@modules/clan/clan.service';

@Injectable()
export class WeeklyResetService {
  constructor(
    private readonly userClanStatService: UserClanStatService,
    private readonly rewardManagementService: RewardManagementService,
    private readonly clanService: ClanService,
  ) {}

  @Cron('0 0 * * 1', { timeZone: 'Asia/Ho_Chi_Minh' }) // mỗi thứ 2 lúc 00:00
  async handleCron() {
    await this.rewardManagementService.rewardWeeklyTopMembers();
    await this.rewardManagementService.rewardWeeklyTopClans();
    await this.userClanStatService.resetWeeklyScores();
    await this.clanService.resetWeeklyScores();
  }
}
