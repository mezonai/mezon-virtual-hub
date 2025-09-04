import { Repository, In, Not } from 'typeorm';
import { QuestFrequency, QuestType } from '@enum';
import { PlayerQuestEntity } from './entity/player-quest.entity';
import { QuestEventEmitter } from './events/quest.events';
import { PlayerSessionManager } from '@modules/colyseus/player/PlayerSessionManager';
import { InjectRepository } from '@nestjs/typeorm';

export class PlayerQuestProgressService {
  constructor(
    @InjectRepository(PlayerQuestEntity)
    private readonly playerQuestRepo: Repository<PlayerQuestEntity>,
  ) {}

  async addProgress(userId: string, questType: QuestType, amount = 1) {
    const playerQuests = await this.playerQuestRepo.find({
      where: { user: { id: userId }, quest: { type: questType } },
      relations: ['quest'],
    });
    if (!playerQuests.length) return;

    const now = new Date();
    const questsToSave: PlayerQuestEntity[] = [];
    const completedQuests: PlayerQuestEntity[] = [];

    for (const pq of playerQuests) {
      if (pq.completed_at || this.isQuestExpired(pq)) continue;

      pq.progress = Math.max(0, Math.min(pq.progress + amount, pq.quest.total_progress));

      if (pq.progress >= pq.quest.total_progress && !pq.completed_at) {
        pq.completed_at = now;
        pq.is_completed = true;
        completedQuests.push(pq);
      }

      questsToSave.push(pq);
    }

    if (questsToSave.length) {
      await this.playerQuestRepo.save(questsToSave);
    }

    for (const pq of completedQuests) {
      QuestEventEmitter.emitCompleted(userId, pq.quest.type);
    }

    this.notifyHasUnclaimedQuests(userId);
  }

  public async notifyHasUnclaimedQuests(userId: string) {
    const playerQuests = await this.playerQuestRepo.find({
      where: { user: { id: userId }, quest: { type: Not(In([QuestType.NEWBIE_LOGIN, QuestType.NEWBIE_LOGIN_SPECIAL])) } },
      relations: ['quest'],
    });

    const hasUnclaimed = playerQuests.some(pq => pq.is_completed && !pq.is_claimed);

    const client = PlayerSessionManager.getClient(userId);
    if (client) {
      client.send('notify_mission', {
        sessionId: client.sessionId,
        hasUnclaimed,
        message: hasUnclaimed ? 'You have unclaimed quests!' : '',
      });
    }
  }

  private isQuestExpired(pq: PlayerQuestEntity): boolean {
    if (!pq.start_at) return false;
    const now = new Date();

    if (pq.quest.frequency === QuestFrequency.DAILY) {
      const startOfDay = new Date(pq.start_at);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(startOfDay.getDate() + 1);
      return now >= endOfDay;
    }

    if (pq.quest.frequency === QuestFrequency.WEEKLY) {
      const startOfWeek = new Date(pq.start_at);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      return now >= endOfWeek;
    }

    if (pq.quest.duration_hours) {
      const expireAt = new Date(pq.start_at.getTime() + pq.quest.duration_hours * 3600_000);
      return now > expireAt;
    }

    return false;
  }
}
