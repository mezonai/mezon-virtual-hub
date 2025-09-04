import { QuestFrequency, QuestType } from '@enum';
import { InventoryService } from '@modules/inventory/inventory.service';
import { QuestEntity } from '@modules/quest/entity/quest.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
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
  IsNull,
  LessThan,
  MoreThan,
  Not,
  Repository,
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
    private inventoryService: InventoryService,
  ) {}

  async getPlayerQuests(userId: string) {
    const quests = await this.playerQuestRepo.find({
      where: { user: { id: userId } },
      relations: [
        'quest',
        'quest.reward',
        'quest.reward.items',
        'quest.reward.items.pet',
        'quest.reward.items.food',
        'quest.reward.items.item',
      ],
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
      relations: [
        'quest',
        'quest.reward',
        'quest.reward.items',
        'quest.reward.items.pet',
        'quest.reward.items.food',
        'quest.reward.items.item',
      ],
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
      daily: this.sortQuestsByStatusAndId(grouped[QuestFrequency.DAILY] ?? []),
      weekly: this.sortQuestsByStatusAndId(
        grouped[QuestFrequency.WEEKLY] ?? [],
      ),
    };
  }

  private sortQuestsByStatusAndId(quests: ReturnType<typeof this.mapQuest>[]) {
    const getOrder = (q: (typeof quests)[number]) => {
      if (q.is_claimed) return 2;
      if (q.is_completed) return 0;
      return 1;
    };

    return quests.sort((a, b) => {
      const orderDiff = getOrder(a) - getOrder(b);
      if (orderDiff !== 0) return orderDiff;

      if (!a.is_completed && !a.is_claimed) {
        const progressA = a.progress / a.total_progress;
        const progressB = b.progress / b.total_progress;
        if (progressA !== progressB) return progressB - progressA;
      }
      return a.id.localeCompare(b.id);
    });
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
        relations: [
          'quest',
          'quest.reward',
          'quest.reward.items',
          'quest.reward.items.pet',
          'quest.reward.items.food',
          'quest.reward.items.item',
        ],
        take: limit,
        skip: (page - 1) * limit,
        order: {
          [sort_by]: order,
        },
      }),
      this.getNextNewbiePlayerQuest(userId),
    ]);

    return quests.map((q) =>
      this.toQuestProgressDto(q, this.isQuestAvailable(q, nextQuest)),
    );
  }

  async getNextNewbiePlayerQuest(userId: string) {
    const now = new Date();
    const startOfDayUTC = moment.utc(now).startOf('day').toDate();
    const endOfDayUTC = moment.utc(now).endOf('day').toDate();

    return await this.playerQuestRepo.findOne({
      where: [
        {
          user: { id: userId },
          quest: {
            type: In([QuestType.NEWBIE_LOGIN, QuestType.NEWBIE_LOGIN_SPECIAL]),
          },
          completed_at: IsNull(),
          end_at: MoreThan(now),
          start_at: LessThan(now),
        },
        {
          user: { id: userId },
          quest: {
            type: In([QuestType.NEWBIE_LOGIN, QuestType.NEWBIE_LOGIN_SPECIAL]),
          },
          completed_at: Between(startOfDayUTC, endOfDayUTC),
          end_at: MoreThan(now),
          start_at: LessThan(now),
        },
      ],
      relations: ['quest'],
      order: { start_at: 'ASC' },
    });
  }

  toQuestProgressDto(
    entity: PlayerQuestEntity,
    isAvailable: boolean,
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
      rewards: quest.reward?.items,
      is_available: isAvailable,
    };
  }

  private isQuestAvailable(
    entity: PlayerQuestEntity,
    nextQuest?: PlayerQuestEntity | null,
  ): boolean {
    if (!nextQuest) return false;

    return nextQuest.id === entity.id && !nextQuest.completed_at;
  }

  async deleteLoginQuests(userId: string) {
    const quests = await this.playerQuestRepo.find({
      where: {
        user: { id: userId },
      },
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
      description: pq.quest.description,
      frequency: pq.quest.frequency,
      progress: pq.progress,
      total_progress: pq.quest.total_progress,
      is_completed: pq.is_completed,
      is_claimed: pq.is_claimed,
      rewards: pq.quest?.reward?.items,
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

    const others = missingQuests.filter(
      (q) =>
        q.type !== QuestType.NEWBIE_LOGIN &&
        q.type !== QuestType.NEWBIE_LOGIN_SPECIAL,
    );

    for (const quest of others) {
      const existingPQ = await this.playerQuestRepo.findOne({
        where: { user: { id: userId }, quest: { id: quest.id } },
      });

      let startAt: Date;
      let endAt: Date;
      let progress = 0;

      if (quest.frequency === QuestFrequency.DAILY) {
        startAt = firstLoginDay.clone().startOf('day').toDate();
        endAt = firstLoginDay.clone().endOf('day').toDate();
      } else if (quest.frequency === QuestFrequency.WEEKLY) {
        startAt = firstLoginDay.clone().startOf('week').toDate();
        endAt = firstLoginDay.clone().endOf('week').toDate();
      } else {
        startAt = firstLoginDay.clone().toDate();
        endAt = quest.duration_hours
          ? firstLoginDay.clone().add(quest.duration_hours, 'hours').toDate()
          : firstLoginDay.clone().endOf('day').toDate();
      }

      if (existingPQ) {
        if (existingPQ.end_at && existingPQ.end_at > new Date()) {
          progress = existingPQ.progress ?? 0;
          startAt = existingPQ.start_at ?? startAt;
          endAt = existingPQ.end_at ?? endAt;

          existingPQ.progress = progress;
          existingPQ.start_at = startAt;
          existingPQ.end_at = endAt;

          toCreate.push(existingPQ);
          continue;
        }

        existingPQ.progress = 0;
        existingPQ.start_at = startAt;
        existingPQ.end_at = endAt;
        toCreate.push(existingPQ);
      } else {
        toCreate.push(
          this.playerQuestRepo.create({
            user: { id: userId },
            quest,
            progress: 0,
            start_at: startAt,
            end_at: endAt,
          }),
        );
      }
    }

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

    const missing = allQuests.filter((q) => !existingQuestIds.has(q.id));
    return missing;
  }

  async finishQuest(
    user: UserEntity,
    player_quest_id: string,
  ): Promise<PlayerQuestEntity> {
    const playerQuest = await this.playerQuestRepo.findOne({
      where: { user: { id: user.id }, id: player_quest_id },
      relations: ['quest', 'quest.reward', 'quest.reward.items'],
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

      const availableQuest = await this.getNextNewbiePlayerQuest(user.id);

      if (!this.isQuestAvailable(playerQuest, availableQuest)) {
        throw new BadRequestException(
          'This login quest is not available. Please finish the next quest in order.',
        );
      }

      if (
        availableQuest &&
        availableQuest.completed_at &&
        availableQuest.completed_at.getTime() >= startOfDayUTC.getTime() &&
        availableQuest.completed_at.getTime() <= endOfDayUTC.getTime()
      ) {
        throw new BadRequestException(
          'You already completed a login quest today.',
        );
      }

      playerQuest.is_completed = true;
      playerQuest.progress = playerQuest.quest.total_progress;
      playerQuest.completed_at = now;

      await this.inventoryService.processRewardItems(
        user,
        playerQuest.quest.reward.items,
      );

      playerQuest.is_claimed = true;
    }

    return await this.playerQuestRepo.save(playerQuest);
  }
}
