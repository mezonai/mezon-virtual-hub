import { QuestFrequency, QuestType } from '@enum';
import { QuestEntity } from '@modules/quest/entity/quest.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import {
  Between,
  In,
  MoreThan,
  Repository
} from 'typeorm';
import {
  FinishQuestQueryDto,
  NewbieRewardDto,
  PlayerQuestQueryDto,
  UpdatePlayerQuestDto,
} from './dto/player-quest.dto';
import { PlayerQuestEntity } from './entity/player-quest.entity';

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

  async getNewbieLoginQuests(userId: string, query: PlayerQuestQueryDto) {
    const {
      page = 1,
      limit = 50,
      sort_by = 'start_at',
      order = 'DESC',
    } = query;

    const [quests, nextQuest] = await Promise.all([
      this.playerQuestRepo.find({
        where: {
          user: { id: userId },
          quest: {
            type: In([QuestType.NEWBIE_LOGIN, QuestType.NEWBIE_LOGIN_SPECIAL]),
          },
        },
        relations: ['quest', 'quest.reward', 'quest.reward.items'],
        take: limit,
        skip: (page - 1) * limit,
        order: {
          [sort_by]: order,
        },
      }),
      this.getNextNewbiePlayerQuest(userId),
    ]);

    return quests.map((q) => this.toQuestProgressDto(q, nextQuest));
  }

  async getNextNewbiePlayerQuest(userId: string) {
    const now = new Date();

    return await this.playerQuestRepo.findOne({
      where: {
        user: { id: userId },
        quest: {
          type: In([QuestType.NEWBIE_LOGIN, QuestType.NEWBIE_LOGIN_SPECIAL]),
        },
        is_completed: false,
        end_at: MoreThan(now),
      },
      relations: ['quest'],
      order: { quest: { name: 'ASC' } },
    });
  }

  toQuestProgressDto(
    entity: PlayerQuestEntity,
    nextQuest?: PlayerQuestEntity | null,
  ): NewbieRewardDto {
    const { quest } = entity;
    return {
      id: entity.id,
      end_at: entity.end_at,
      quest_id: quest?.id,
      name: quest?.name,
      description: quest.type,
      quest_type: quest?.type,
      is_claimed: entity.is_claimed,
      rewards: quest.reward.items,
      is_available: nextQuest ? nextQuest.id === entity.id : false,
    };
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

  async initQuest(
    userId: string,
    { timezone = 'Asia/Ho_Chi_Minh' }: FinishQuestQueryDto,
  ) {
    const missingQuests = await this.findMissingQuestsForPlayer(userId);

    if (!missingQuests.length) {
      return { message: 'No missing quests to initialize' };
    }

    const normalDailies = missingQuests.filter(
      (q) => q.type === QuestType.NEWBIE_LOGIN,
    );
    const lastDaily = missingQuests.find(
      (q) => q.type === QuestType.NEWBIE_LOGIN_SPECIAL,
    );

    const firstLoginDay = moment.tz(timezone).startOf('day');
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

    if (!toCreate.length) {
      return { message: 'No missing quests to initialize' };
    }

    return await this.playerQuestRepo.save(toCreate);
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

      const availableQuest = await this.getNextNewbiePlayerQuest(userId);

      if (availableQuest && availableQuest.id !== playerQuest.id) {
        throw new BadRequestException(
          'This login quest is not available. Please finish the next quest in order.',
        );
      }

      if (completedToday) {
        throw new BadRequestException(
          'You already completed a login quest today.',
        );
      }
      playerQuest.is_completed = true;
      playerQuest.progress = playerQuest.quest.total_progress;
      playerQuest.completed_at = now;
    }

    return await this.playerQuestRepo.save(playerQuest);
  }
}
