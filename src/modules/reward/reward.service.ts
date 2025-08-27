// reward.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RewardEntity } from './entity/reward.entity';
import { QuestEntity } from '@modules/quest/entity/quest.entity';
import { QuestType } from '@enum';
import moment from 'moment';

@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(RewardEntity)
    private readonly playerQuestRepo: Repository<RewardEntity>,
    @InjectRepository(QuestEntity)
    private questRepo: Repository<QuestEntity>,
  ) {}
}
