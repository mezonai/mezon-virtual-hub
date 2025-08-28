// reward.service.ts
import { FoodEntity } from '@modules/food/entity/food.entity';
import { QuestEntity } from '@modules/quest/entity/quest.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRewardManagementDto, QueryRewardDto } from './dto/reward.dto';
import { BaseService } from '@libs/base/base.service';
import { RewardEntity } from '@modules/reward/entity/reward.entity';

@Injectable()
export class RewardManagementService extends BaseService<RewardEntity> {
  constructor(
    @InjectRepository(RewardEntity)
    private readonly rewardRepo: Repository<RewardEntity>,
    @InjectRepository(QuestEntity)
    private questRepo: Repository<QuestEntity>,
  ) {
    super(rewardRepo, RewardEntity.name);
  }

  async getAll(query: QueryRewardDto) {
    const { description, name, type, food_type, item_type } = query;
    const rewards = await this.rewardRepo.find({
      where: {
        name,
        type,
        description,
        items: { food: { type: food_type }, item: { type: item_type } },
      },
      relations: ['items', 'items.food', 'items.item'],
    });
    return rewards;
  }

  async createRewardManagement(payload: CreateRewardManagementDto) {
    const newRewardManagement = this.rewardRepo.create(payload);
    return await this.rewardRepo.save(newRewardManagement);
  }

  async updateRewardManagement(id: string, payload: CreateRewardManagementDto) {
    const reward = await this.findOneNotDeletedById(id);
    Object.assign(reward, payload);

    const updateRewardManagement = await this.save(reward);

    return await this.rewardRepo.save(updateRewardManagement);
  }
}
