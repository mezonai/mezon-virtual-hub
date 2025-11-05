import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserClanStatService } from './user-clan-stat.service';

@Injectable()
export class DailyResetService {
  constructor(
    private readonly userClanStatService: UserClanStatService
  ) {}

  // 🕛 Chạy mỗi ngày lúc 00:00 sáng (theo giờ server hoặc Asia/Ho_Chi_Minh nếu set)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetDailyHarvestCounts() {
    await this.userClanStatService.resetDailyHarvestCount();
  }
}
