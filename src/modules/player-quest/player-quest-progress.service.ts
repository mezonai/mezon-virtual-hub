import { Repository, In, Not } from 'typeorm';
import { QuestFrequency, QuestType } from '@enum';
import { PlayerQuestEntity } from './entity/player-quest.entity';
import { QuestEventEmitter } from './events/quest.events';
import { PlayerSessionManager } from '@modules/colyseus/player/PlayerSessionManager';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageTypes } from '@modules/colyseus/MessageTypes';
import { PlayerQuestService } from './player-quest.service';
import { Inject } from '@nestjs/common';

export class PlayerQuestProgressService {
  constructor(
    @Inject()
    private readonly playerQuestService: PlayerQuestService,
  ) {}

  async addProgress(
    userId: string,
    questType: QuestType,
    amount = 1,
    label?: string,
  ) {
    const playerQuests = await this.playerQuestService.find({
      where: { user: { id: userId }, quest: { type: questType } },
      relations: ['quest'],
    });

    if (!playerQuests.length) return;

    const now = new Date();
    const questsToSave: PlayerQuestEntity[] = [];

    if (this.playerQuestService.hasCompletedNewbieLoginToday(playerQuests)) {
      return;
    }

    let hasCompleted = false;
    for (const pq of playerQuests) {
      if (pq.completed_at || this.isAvailableQuest(pq)) continue;

      if (!pq.progress_history) {
        pq.progress_history = [];
      }

      const isVisitOffice = questType === QuestType.VISIT_OFFICE && label;
      const isLoginDays = questType === QuestType.LOGIN_DAYS;

      if (
        (isVisitOffice && !this.checkLoginAndOfficeQuests(pq, now, label)) ||
        (isLoginDays && !this.checkLoginAndOfficeQuests(pq, now))
      ) {
        continue;
      }

      pq.progress_history.push({
        timestamp: now,
        ...(label ? { label } : {}),
      });

      // Check completion based on history length
      if (pq.progress_history.length >= pq.quest.total_progress) {
        pq.completed_at = now;
        pq.is_completed = true;
        hasCompleted = true;
      }

      questsToSave.push(pq);
    }

    if (questsToSave.length) {
      await this.playerQuestService.saveAll(questsToSave);
    }

    if (hasCompleted) {
      await this.notifyHasUnclaimedQuests(userId);
    }
  }

  checkLoginAndOfficeQuests(
    pq: PlayerQuestEntity,
    now: Date = new Date(),
    label?: string,
  ) {
    const today = now.toDateString();
    return !pq.progress_history.some(
      (p) =>
        (!label || p.label === label) &&
        new Date(p.timestamp).toDateString() === today,
    );
  }

  public async notifyHasUnclaimedQuests(userId: string) {
    const client = PlayerSessionManager.getClient(userId);
    if (client) {
      client.send(MessageTypes.NOTIFY_MISSION, {
        sessionId: client.sessionId,
        message: 'Notify mission',
      });
    }
  }

  private isAvailableQuest(pq: PlayerQuestEntity): boolean {
    if (!pq.start_at) return false;
    const now = new Date();
    const startAt = new Date(pq.start_at);

    if (startAt.getTime() > now.getTime()) {
      return true;
    }

    switch (pq.quest.frequency) {
      case QuestFrequency.DAILY: {
        const startOfDay = new Date(pq.start_at);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(pq.end_at ?? startOfDay);
        endOfDay.setHours(23, 59, 59, 999);
        return now > endOfDay;
      }

      case QuestFrequency.WEEKLY: {
        const startOfWeek = new Date(pq.start_at);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return now > endOfWeek;
      }

      default:
        return true;
    }
  }
}
