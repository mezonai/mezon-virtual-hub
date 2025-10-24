import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserClantScoreEntity } from './entity/user-clant-score.entity';
import { CreateUserClanScoreDto, UpdateUserClanScoreDto } from './dto/user-clan-score.dto';

@Injectable()
export class UserClantScoreService {
  constructor(
    @InjectRepository(UserClantScoreEntity)
    private readonly userClantScoreRepo: Repository<UserClantScoreEntity>,
  ) {}

  async findAll(): Promise<UserClantScoreEntity[]> {
    return this.userClantScoreRepo.find({ relations: ['user', 'clan'] });
  }

  async findByUserAndClan(userId: string, clanId: string): Promise<UserClantScoreEntity> {
    const score = await this.userClantScoreRepo.findOne({ where: { user_id: userId, clan_id: clanId }, relations: ['user', 'clan'] });
    if (!score) throw new NotFoundException('Score record not found');
    return score;
  }

  async create(dto: CreateUserClanScoreDto): Promise<UserClantScoreEntity> {
    const existing = await this.userClantScoreRepo.findOne({ where: { user_id: dto.user_id, clan_id: dto.clan_id } });
    if (existing) return existing;

    const score = this.userClantScoreRepo.create({ ...dto, total_score: 0, weekly_score: 0 });
    return this.userClantScoreRepo.save(score);
  }

  async update(id: string, dto: UpdateUserClanScoreDto): Promise<UserClantScoreEntity> {
    const score = await this.userClantScoreRepo.findOne({ where: { id } });
    if (!score) throw new NotFoundException('Score record not found');

    Object.assign(score, dto);
    return this.userClantScoreRepo.save(score);
  }

  async delete(id: string): Promise<void> {
    await this.userClantScoreRepo.softDelete(id);
  }

  async resetWeekly(): Promise<void> {
    await this.userClantScoreRepo
      .createQueryBuilder()
      .update(UserClantScoreEntity)
      .set({ weekly_score: 0, last_reset_at: () => 'NOW()' })
      .execute();
  }
}
