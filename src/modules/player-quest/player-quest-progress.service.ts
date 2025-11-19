import { QuestFrequency, QuestType } from '@enum';
import { Logger } from '@libs/logger';
import { MessageTypes } from '@modules/colyseus/MessageTypes';
import { PlayerSessionManager } from '@modules/colyseus/player/PlayerSessionManager';
import { Inject } from '@nestjs/common';
import moment from 'moment';
import { In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { PlayerQuestEntity } from './entity/player-quest.entity';
import { PlayerQuestService } from './player-quest.service';

export class PlayerQuestProgressService {
  constructor(
    @Inject()
    private readonly playerQuestService: PlayerQuestService,
    private readonly logger: Logger,
  ) {}

  async addProgress(
    userId: string,
    questType: QuestType,
    amount = 1,
    label?: string,
  ) {
    if (
      [QuestType.NEWBIE_LOGIN, QuestType.NEWBIE_LOGIN_SPECIAL].includes(
        questType,
      )
    ) {
      return;
    }
    const now = new Date();

    const playerQuests = await this.playerQuestService.find({
      where: {
        user: { id: userId },
        quest: {
          type: questType,
        },
        start_at: LessThanOrEqual(now),
        end_at: MoreThanOrEqual(now),
      },
      relations: ['quest'],
    });

    if (!playerQuests.length) return;

    const questsToSave: PlayerQuestEntity[] = [];
    let hasCompleted = false;

    for (const pq of playerQuests) {
      if (pq.completed_at || this.isUnavailableQuest(pq)) continue;

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

      for (let i = 0; i < amount; i++) {
        pq.progress_history.push({
          timestamp: now,
          ...(label ? { label } : {}),
        });
      }

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
      this.logger.log(`User ${userId} has complete ${questType}`);
      await this.notifyHasUnclaimedQuests(userId);
    }
  }

  async completeQuestForUser(userId: string, questTypes: string[]) {
    const now = new Date();
    const playerQuests = await this.playerQuestService.find({
      where: {
        user: { id: userId },
        quest: { type: In(questTypes) },
        start_at: LessThanOrEqual(now),
        end_at: MoreThanOrEqual(now),
      },
      relations: ['quest'],
      order: { end_at: 'ASC' },
    });

    if (!playerQuests.length) return;

    // If any quest already completed today → stop
    if (this.playerQuestService.hasCompletedNewbieLoginToday(playerQuests)) {
      return;
    }

    // Pick the first uncompleted quest (already sorted by end_at)
    const questToComplete = playerQuests.find((pq) => !pq.completed_at);
    if (!questToComplete) return;

    if (!questToComplete.progress_history) {
      questToComplete.progress_history = [];
    }

    questToComplete.progress_history.push({ timestamp: now });
    questToComplete.completed_at = now;
    questToComplete.is_completed = true;

    await this.playerQuestService.saveAll([questToComplete]);
    this.logger.log(
      `User ${userId} has completed quest: ${questToComplete.quest.type}`,
    );
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
      this.logger.log(
        `Send ${MessageTypes.NOTIFY_MISSION} to client: ${client.sessionId} at ${moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')}`,
      );
      client.send(MessageTypes.NOTIFY_MISSION, {
        sessionId: client.sessionId,
        message: 'Notify mission',
      });
    }
  }

  private isUnavailableQuest(pq: PlayerQuestEntity): boolean {
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
