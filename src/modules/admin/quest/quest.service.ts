// quest.service.ts
import { BaseService } from '@libs/base/base.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuestManagementDto } from './dto/quest.dto';
import { QuestEntity } from './entity/quest.entity';
import { RewardEntity } from '@modules/reward/entity/reward.entity';

@Injectable()
export class QuestManagementService extends BaseService<QuestEntity> {
  constructor(
    @InjectRepository(QuestEntity)
    private readonly questRepo: Repository<QuestEntity>,
    @InjectRepository(RewardEntity)
    private readonly rewardRepo: Repository<RewardEntity>,
  ) {
    super(questRepo, QuestEntity.name);
  }

  async getAll() {
    const quests = await this.questRepo.find();
    return quests;
  }

  async createQuestManagement(payload: CreateQuestManagementDto) {
    const { reward_type, ...rest } = payload;
    const existedReward = await this.rewardRepo.findOne({
      where: { type: reward_type },
    });

    if (!existedReward) {
      throw new NotFoundException(`Reward with type: ${reward_type} not found`);
    }

    const newQuestManagement = this.questRepo.create(rest);
    newQuestManagement.reward = existedReward;
    return await this.questRepo.save(newQuestManagement);
  }

  async updateQuestManagement(id: string, payload: CreateQuestManagementDto) {
    const quest = await this.findOneNotDeletedById(id);
    Object.assign(quest, payload);

    const updateQuestManagement = await this.save(quest);

    return await this.questRepo.save(updateQuestManagement);
  }
}
