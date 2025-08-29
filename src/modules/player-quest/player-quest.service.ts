// player-quest.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { PlayerQuestEntity } from './entity/player-quest.entity';
import { QuestEntity } from '@modules/quest/entity/quest.entity';
import { QuestFrequency, QuestType } from '@enum';
import moment from 'moment';
import {
  PlayerQuestQueryDto,
  UpdatePlayerQuestDto,
} from './dto/player-quest.dto';
const TIMEZONE = 'Asia/Ho_Chi_Minh';

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
        .filter((pq) => pq.quest.frequency === QuestFrequency.DAILY)
        .map((pq) => this.mapQuest(pq)),

      weekly: quests
        .filter((pq) => pq.quest.frequency === QuestFrequency.WEEKLY)
        .map((pq) => this.mapQuest(pq)),
    };
  }

  async getPlayerQuestsByFrequency(userId: string, query: PlayerQuestQueryDto) {
    const { page = 1, limit = 50, sort_by = 'start_at', order = 'ASC' } = query;

    const quests = await this.playerQuestRepo.find({
      where: {
        user: { id: userId },
        quest: {
          type: Not(
            In([QuestType.NEWBIE_LOGIN, QuestType.NEWBIE_LOGIN_SPECIAL]),
          ),
        },
      },
      relations: ['quest', 'quest.reward', 'quest.reward.items', 'user'],
      take: limit,
      skip: (page - 1) * limit,
      order: { [sort_by]: order },
    });

    const groupByFrequency = (list: typeof quests) =>
      list.reduce(
        (acc, pq) => {
          const freq = pq.quest.frequency;
          if (!acc[freq]) acc[freq] = [];
          acc[freq].push(this.mapQuest(pq));
          return acc;
        },
        {} as Record<string, ReturnType<typeof this.mapQuest>[]>,
      );

    const grouped = groupByFrequency(quests);

    return {
      daily: grouped[QuestFrequency.DAILY] ?? [],
      weekly: grouped[QuestFrequency.WEEKLY] ?? [],
    };
  }

  async getLoginQuest(userId: string, query: PlayerQuestQueryDto) {
    const {
      page = 1,
      limit = 50,
      sort_by = 'start_at',
      order = 'DESC',
      search,
    } = query;

    const quests = await this.playerQuestRepo.find({
      where: { user: { id: userId } },
      relations: ['quest', 'quest.reward', 'quest.reward.items', 'user'],
      take: limit,
      skip: (page - 1) * limit,
      order: {
        [sort_by]: order,
      },
    });

    return quests.map((q) => ({
      ...q,
      user: { id: q.user.id, username: q.user.username },
    }));
  }

  async deleteLoginQuests(userId: string) {
    const quests = await this.playerQuestRepo.find({
      where: {
        user: { id: userId },
        quest: {
          type: In([QuestType.NEWBIE_LOGIN, QuestType.NEWBIE_LOGIN_SPECIAL]),
        },
      },
      relations: ['quest', 'quest.reward', 'quest.reward.items'],
    });

    if (!quests.length) return [];
    await this.playerQuestRepo.remove(quests);
    return quests;
  }

  async updatePlayerQuest(
    userId: string,
    questId: string,
    dto: UpdatePlayerQuestDto,
  ): Promise<PlayerQuestEntity> {
    const playerQuest = await this.playerQuestRepo.findOne({
      where: { quest: { id: questId }, user: { id: userId } },
    });

    if (!playerQuest) throw new NotFoundException('Player quest not found');
    if (dto.progress !== undefined) playerQuest.progress = dto.progress;
    if (dto.is_completed !== undefined) {
      playerQuest.is_completed = dto.is_completed;
    }
    if (dto.is_claimed !== undefined) playerQuest.is_claimed = dto.is_claimed;
    return this.playerQuestRepo.save(playerQuest);
  }

  mapQuest(pq: PlayerQuestEntity) {
    return {
      id: pq.quest.id,
      name: pq.quest.name,
      frequency: pq.quest.frequency,
      progress: pq.progress,
      total_progress: pq.quest.total_progress,
      is_completed: pq.is_completed,
      is_claimed: pq.is_claimed,
    };
  }

  mapPlayerQuests(playerQuests: PlayerQuestEntity[]): any[] {
    return playerQuests.map((pq) => ({
      id: pq.id,
      questId: pq.quest.id,
      name: pq.quest.name,
      type: pq.quest.type,
      progress: pq.progress,
      startAt: pq.start_at,
      endAt: pq.end_at,
      completed: pq.progress >= pq.quest.total_progress,
    }));
  }

  async initLoginQuest(
    userId: string,
  ): Promise<{ quests: PlayerQuestEntity[] }> {
    const existing = await this.playerQuestRepo.find({
      where: { user: { id: userId } },
      relations: ['quest'],
      order: { id: 'ASC' },
    });

    if (
      existing.some(
        (pq) =>
          pq.quest.type === QuestType.NEWBIE_LOGIN ||
          pq.quest.type === QuestType.NEWBIE_LOGIN_SPECIAL,
      )
    ) {
      throw new BadRequestException(
        'Login quests already initialized for this user',
      );
    }

    let missingQuests = await this.findMissingQuestsForPlayer(userId);
    if (!missingQuests.length) {
      throw new BadRequestException('No missing login quests to initialize');
    }

    const normalDailies = missingQuests.filter(
      (q) => q.type === QuestType.NEWBIE_LOGIN,
    );
    const lastDaily = missingQuests.find(
      (q) => q.type === QuestType.NEWBIE_LOGIN_SPECIAL,
    );

    const firstLoginDay = moment.tz(TIMEZONE).startOf('day');
    const toCreate: PlayerQuestEntity[] = [];

    normalDailies.forEach((quest, idx) => {
      const startAt = firstLoginDay.clone().add(idx, 'days').toDate();
      const endAt = firstLoginDay.clone().add(9, 'days').endOf('day').toDate();

      toCreate.push(
        this.playerQuestRepo.create({
          user: { id: userId },
          quest,
          progress: 0,
          start_at: startAt,
          end_at: endAt,
        }),
      );
    });

    if (lastDaily) {
      const startAt = firstLoginDay.clone().add(6, 'days').toDate();
      const endAt = firstLoginDay.clone().add(9, 'days').endOf('day').toDate();

      toCreate.push(
        this.playerQuestRepo.create({
          user: { id: userId },
          quest: lastDaily,
          progress: 0,
          start_at: startAt,
          end_at: endAt,
        }),
      );
    }

    const saved = await this.playerQuestRepo.save(toCreate);

    return {
      quests: this.mapPlayerQuests(saved),
    };
  }

  async findMissingQuestsForPlayer(userId: string): Promise<QuestEntity[]> {
    const allQuests = await this.questRepo.find();
    if (!allQuests.length) return [];

    const existingPlayerQuests = await this.playerQuestRepo.find({
      where: { user: { id: userId } },
      relations: ['quest'],
    });
    const existingQuestIds = new Set(
      existingPlayerQuests.map((pq) => pq.quest.id),
    );

    return allQuests.filter((q) => !existingQuestIds.has(q.id));
  }

  async finishQuest(
    userId: string,
    player_quest_id: string,
  ): Promise<PlayerQuestEntity> {
    const playerQuest = await this.playerQuestRepo.findOne({
      where: { user: { id: userId }, id: player_quest_id },
      relations: ['quest', 'user'],
    });

    if (!playerQuest) {
      throw new NotFoundException('Quest not found for player.');
    }

    if (playerQuest.is_completed) {
      throw new BadRequestException('Quest already completed.');
    }

    const now = new Date();
    // Check unlock time
    if (
      playerQuest.start_at &&
      now.getTime() < new Date(playerQuest.start_at).getTime()
    ) {
      throw new BadRequestException('This quest is not available yet.');
    }

    // Check expire time
    if (
      playerQuest.end_at &&
      now.getTime() > new Date(playerQuest.end_at).getTime()
    ) {
      throw new BadRequestException('This quest has expired.');
    }

    // Check newbie login daily rule
    if (
      playerQuest.quest.type === QuestType.NEWBIE_LOGIN ||
      playerQuest.quest.type === QuestType.NEWBIE_LOGIN_SPECIAL
    ) {
      const startOfDayUTC = moment.utc(now).startOf('day').toDate();
      const endOfDayUTC = moment.utc(now).endOf('day').toDate();

      const completedToday = await this.playerQuestRepo.findOne({
        where: {
          user: { id: userId },
          quest: {
            type: In([QuestType.NEWBIE_LOGIN, QuestType.NEWBIE_LOGIN_SPECIAL]),
          },
          is_completed: true,
          completed_at: Between(startOfDayUTC, endOfDayUTC),
        },
      });

      if (completedToday) {
        throw new BadRequestException(
          'You already completed a login quest today.',
        );
      }
    }

    playerQuest.is_completed = true;
    playerQuest.progress = playerQuest.quest.total_progress;
    playerQuest.completed_at = now;

    return await this.playerQuestRepo.save(playerQuest);
  }
}
