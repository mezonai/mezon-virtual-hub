import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UserClanStatService } from './user-clan-stat.service';

@Injectable()
export class WeeklyResetService {
  constructor(private readonly userClanStatService: UserClanStatService) {}

  @Cron('0 0 * * 1', { timeZone: 'Asia/Ho_Chi_Minh' }) // mỗi thứ 2 lúc 00:00
  async handleCron() {
    await this.userClanStatService.resetWeeklyScores();
  }
}
