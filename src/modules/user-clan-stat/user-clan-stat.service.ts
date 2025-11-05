import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { UserClanStatEntity } from './entity/user-clan-stat.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { FARM_CONFIG } from '@constant/farm.constant';

@Injectable()
export class UserClanStatService {
  constructor(
    @InjectRepository(UserClanStatEntity)
    private readonly userClanStatRepo: Repository<UserClanStatEntity>,
     private readonly dataSource: DataSource,
  ) {}

  async addScore(userId: string, clanId: string, points: number) {
    let score = await this.userClanStatRepo.findOne({
      where: { user_id: userId, clan_id: clanId },
    });

    if (!score) {
      score = this.userClanStatRepo.create({
        user_id: userId,
        clan_id: clanId,
        total_score: 0,
        weekly_score: 0,
        harvest_count: 10,
        harvest_count_use: 0,
        harvest_interrupt_count: 10,
        harvest_interrupt_count_use: 0,
      });
    }

    score.total_score = (score.total_score ?? 0) + points;
    score.weekly_score = (score.weekly_score ?? 0) + points;
    score.harvest_count_use += 1;

    return await this.userClanStatRepo.save(score);
  }

  async getHarvestCounts(user: UserEntity, clanId: string) {
    const record = await this.userClanStatRepo.findOne({
      where: { user_id: user.id, clan_id: clanId, deleted_at: IsNull() },
    });

    if (!record) throw new NotFoundException('UserClanStat record not found');

    return {
      harvest_count: record.harvest_count ?? 0,
      harvest_count_use: record.harvest_count_use ?? 0,
      harvest_interrupt_count: record.harvest_interrupt_count ?? 0,
      harvest_interrupt_count_use: record.harvest_interrupt_count_use ?? 0
    };
  }
 async resetWeeklyScores() {
    const now = new Date();
    console.log('[WeeklyResetService] Starting weekly score reset at', now);

    return await this.dataSource.transaction(async (manager) => {
      const result = await manager
        .createQueryBuilder()
        .update(UserClanStatEntity)
        .set({
          weekly_score: 0,
          last_reset_at: now,
        })
        .execute();

      console.log(`Weekly scores reset completed at ${now}, affected ${result.affected} users.`);
      return { message: 'Weekly reset successful', affected: result.affected };
    });
  }

  async resetDailyHarvestCount() {
    const now = new Date();
    console.log('[DailyResetService] Starting daily harvest reset at', now);

    return await this.dataSource.transaction(async (manager) => {
      const result = await manager
        .createQueryBuilder()
        .update(UserClanStatEntity)
        .set({
          harvest_count_use: 0,
          harvest_interrupt_count_use: 0,
          last_reset_at: now,
        })
        .execute();

      console.log(`Daily harvest counts reset completed at ${now}, affected ${result.affected} users.`);
      return { message: 'Daily reset successful', affected: result.affected };
    });
  }
}
