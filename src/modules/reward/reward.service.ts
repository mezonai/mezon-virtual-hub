// reward.service.ts
import { FoodEntity } from '@modules/food/entity/food.entity';
import { QuestEntity } from '@modules/quest/entity/quest.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRewardDto } from './dto/reward.dto';
import { RewardEntity } from './entity/reward.entity';
import { BaseService } from '@libs/base/base.service';

@Injectable()
export class RewardService extends BaseService<RewardEntity> {
  constructor(
    @InjectRepository(RewardEntity)
    private readonly rewardRepo: Repository<RewardEntity>,
    @InjectRepository(QuestEntity)
    private questRepo: Repository<QuestEntity>,
  ) {
    super(rewardRepo, RewardEntity.name);
  }

  async getAll() {
    const rewards = await this.rewardRepo.find();
    return rewards;
  }

  async createReward(payload: CreateRewardDto) {
    const newReward = this.rewardRepo.create(payload);
    return await this.rewardRepo.save(newReward);
  }

  async updateReward(id: string, payload: CreateRewardDto) {
    const reward = await this.findOneNotDeletedById(id);
    Object.assign(reward, payload);

    const updateReward = await this.save(reward);

    return await this.rewardRepo.save(updateReward);
  }
}
