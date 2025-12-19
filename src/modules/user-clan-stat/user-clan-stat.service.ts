import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async addScore(userId: string, clanId: string, points: number) {
    const { score } = await this.getOrCreateUserClanStat(userId, clanId);

    score.total_score = (score.total_score ?? 0) + points;
    score.weekly_score = (score.weekly_score ?? 0) + points;
    //score.harvest_count_use += 1;

    return await this.userClanStatRepo.save(score);
  }

  async getHarvestCounts(userId: string, clanId: string) {
    const { score } = await this.getOrCreateUserClanStat(userId, clanId);

    return {
      harvest_count: score.harvest_count ?? FARM_CONFIG.HARVEST.MAX_HARVEST,
      harvest_count_use: score.harvest_count_use ?? 0,
      harvest_interrupt_count: score.harvest_interrupt_count ?? FARM_CONFIG.HARVEST.MAX_INTERRUPT,
      harvest_interrupt_count_use: score.harvest_interrupt_count_use ?? 0,
    };
  }

  async getOrCreateUserClanStat(userId: string, clanId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.clan_id !== clanId) {
      throw new BadRequestException('User does not belong to this clan');
    }

    let score = await this.userClanStatRepo.findOne({
      where: { user_id: userId, clan_id: clanId, deleted_at: IsNull() },
    });

    if (!score) {
      score = this.userClanStatRepo.create({
        user_id: userId,
        clan_id: clanId,
        total_score: 0,
        weekly_score: 0,
        harvest_count: FARM_CONFIG.HARVEST.MAX_HARVEST,
        harvest_count_use: 0,
        harvest_interrupt_count: FARM_CONFIG.HARVEST.MAX_INTERRUPT,
        harvest_interrupt_count_use: 0,
      });
      await this.userClanStatRepo.save(score);
    }

    return { score };
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
