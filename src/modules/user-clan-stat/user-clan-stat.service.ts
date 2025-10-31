import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserClanStatEntity } from './entity/user-clan-stat.entity';
import { CreateUserClanStatDto, UpdateUserClanStatDto } from './dto/user-clan-stat.dto';

@Injectable()
export class UserClanStatService {
  constructor(
    @InjectRepository(UserClanStatEntity)
    private readonly userClantScoreRepo: Repository<UserClanStatEntity>,
  ) {}

  async findAll(): Promise<UserClanStatEntity[]> {
    return this.userClantScoreRepo.find({ relations: ['user', 'clan'] });
  }

  async findByUserAndClan(userId: string, clanId: string): Promise<UserClanStatEntity> {
    const score = await this.userClantScoreRepo.findOne({ where: { user_id: userId, clan_id: clanId }, relations: ['user', 'clan'] });
    if (!score) throw new NotFoundException('Score record not found');
    return score;
  }

  async create(dto: CreateUserClanStatDto): Promise<UserClanStatEntity> {
    const existing = await this.userClantScoreRepo.findOne({ where: { user_id: dto.user_id, clan_id: dto.clan_id } });
    if (existing) return existing;

    const score = this.userClantScoreRepo.create({ ...dto, total_score: 0, weekly_score: 0 });
    return this.userClantScoreRepo.save(score);
  }

  async updateScore(id: string, dto: UpdateUserClanStatDto): Promise<UserClanStatEntity> {
    const score = await this.userClantScoreRepo.findOne({ where: { id } });
    if (!score) throw new NotFoundException('Score record not found');

    Object.assign(score, dto);
    return this.userClantScoreRepo.save(score);
  }

  async deleteScore(id: string): Promise<void> {
    await this.userClantScoreRepo.softDelete(id);
  }

  async resetWeekly(): Promise<void> {
    await this.userClantScoreRepo
      .createQueryBuilder()
      .update(UserClanStatEntity)
      .set({ weekly_score: 0, last_reset_at: () => 'NOW()' })
      .execute();
  }
}
