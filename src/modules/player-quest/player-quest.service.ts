// player-quest.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerQuestEntity } from './entity/player-quest.entity';
import { QuestEntity } from '@modules/quest/entity/quest.entity';
import { QuestType } from '@enum';
import moment from 'moment';

@Injectable()
export class PlayerQuestService {
  constructor(
    @InjectRepository(PlayerQuestEntity)
    private readonly playerQuestRepo: Repository<PlayerQuestEntity>,
    @InjectRepository(QuestEntity)
    private questRepo: Repository<QuestEntity>,
  ) {}

  async getPlayerQuests(userId: string) {
    const quests = await this.playerQuestRepo.find({
      where: { user: { id: userId } },
      relations: { quest: true },
    });

    return {
      daily: quests
        .filter((pq) => pq.quest.frequency === 'daily')
        .map((pq) => this.mapQuest(pq)),

      weekly: quests
        .filter((pq) => pq.quest.frequency === 'weekly')
        .map((pq) => this.mapQuest(pq)),
    };
  }

  private mapQuest(pq: PlayerQuestEntity) {
    return {
      id: pq.quest.id,
      name: pq.quest.name,
      frequency: pq.quest.frequency,
      progress: pq.progress,
      required_count: pq.quest.required_count,
      is_completed: pq.is_completed,
      is_claimed: pq.is_claimed,
    };
  }

  async initLoginQuest(userId: string): Promise<PlayerQuestEntity> {
    const quest = await this.questRepo.findOneBy({
      type: QuestType.LOGIN_REWARD,
    });
    if (!quest) {
      throw new NotFoundException('Login quest not defined!');
    }

    const startAt = moment().startOf('day');
    const endAt = startAt.clone().add(quest.duration_hours, 'hours');

    const pq = this.playerQuestRepo.create({
      user: { id: userId },
      quest,
      progress: 0,
      start_at: startAt.toDate(),
      end_at: endAt.toDate(),
    });

    return this.playerQuestRepo.save(pq);
  }

  async getLoginQuest(userId: string) {
    return this.playerQuestRepo.findOne({
      where: { user: { id: userId } },
      relations: ['quest', 'quest.reward', 'quest.reward.items'],
    });
  }
}
