import { QuestFrequency, QuestType } from '@enum';
import { BaseService } from '@libs/base/base.service';
import { Logger } from '@libs/logger';
import { InventoryService } from '@modules/inventory/inventory.service';
import { QuestEntity } from '@modules/quest/entity/quest.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { UserService } from '@modules/user/user.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import {
  In,
  IsNull,
  LessThanOrEqual,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import {
  FinishQuestQueryDto,
  NewbieRewardDto,
  PlayerQuestFrequencyDto,
  PlayerQuestQueryDto,
  UpdatePlayerQuestDto,
} from './dto/player-quest.dto';
import { PlayerQuestEntity } from './entity/player-quest.entity';

@Injectable()
export class PlayerQuestService extends BaseService<PlayerQuestEntity> {
  constructor(
    @InjectRepository(PlayerQuestEntity)
    private readonly playerQuestRepo: Repository<PlayerQuestEntity>,
    @InjectRepository(QuestEntity)
    private questRepo: Repository<QuestEntity>,
    private userService: UserService,
    private inventoryService: InventoryService,
    private logger: Logger,
  ) {
    super(playerQuestRepo, PlayerQuestService.name);
  }

  async onModuleInit() {
    this.logger.log(
      'QuestService initialized → creating missing quests for all users...',
    );
    const { initialized, renewed, skipped } = await this.initQuestsForAllUsers({
      timezone: 'Asia/Ho_Chi_Minh',
    });
    this.logger.log(
      `Create done - initialized: ${initialized}, renewed: ${renewed}, skipped: ${skipped}`,
    );
  }

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

    const [quests] = await Promise.all([
      this.playerQuestRepo.find({
        where: {
          user: { id: userId },
          quest: {
            type: In([QuestType.NEWBIE_LOGIN, QuestType.NEWBIE_LOGIN_SPECIAL]),
          },
          end_at: MoreThan(new Date()),
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
    ]);

    return quests.map((q) => this.toQuestProgressDto(q));
  }

  toQuestProgressDto(entity: PlayerQuestEntity): NewbieRewardDto {
    const { quest, start_at, end_at } = entity;
    const now = new Date();

    const isAvailable =
      (!start_at || now >= start_at) && (!end_at || now <= end_at);

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
    if (dto.is_completed !== undefined) {
      playerQuest.is_completed = dto.is_completed;
    }
    if (dto.is_claimed !== undefined) playerQuest.is_claimed = dto.is_claimed;
    return this.playerQuestRepo.save(playerQuest);
  }

  mapQuest(pq: PlayerQuestEntity): PlayerQuestFrequencyDto {
    return {
      id: pq.id,
      name: pq.quest.name,
      description: pq.quest.description,
      frequency: pq.quest.frequency,
      progress: pq.progress_history.length,
      total_progress: pq.quest.total_progress,
      is_completed: pq.is_completed,
      is_claimed: pq.is_claimed,
      rewards: pq.quest?.reward?.items,
    };
  }
  async initQuests(
    userId: string,
    { timezone = 'Asia/Ho_Chi_Minh' }: FinishQuestQueryDto,
  ): Promise<{ message?: string }> {
    const missingQuests = await this.findMissingQuestsForPlayer(userId);
    const firstLoginDay = moment.tz(timezone).startOf('day');
    const toSave: PlayerQuestEntity[] = [];

    if (missingQuests.length) {
      // --- Normal daily newbie login quests ---
      const normalDailies = missingQuests.filter(
        (q) => q.type === QuestType.NEWBIE_LOGIN,
      );

      normalDailies.forEach((quest, idx) => {
        const startAt = firstLoginDay.clone().add(idx, 'days').toDate();
        const endAt = firstLoginDay
          .clone()
          .add(9, 'days')
          .endOf('day')
          .toDate();

        toSave.push(
          this.playerQuestRepo.create({
            user: { id: userId },
            quest,
            start_at: startAt,
            end_at: endAt,
          }),
        );
      });

      const lastDaily = missingQuests.find(
        (q) => q.type === QuestType.NEWBIE_LOGIN_SPECIAL,
      );

      if (lastDaily) {
        const startAt = firstLoginDay.clone().add(6, 'days').toDate();
        const endAt = firstLoginDay
          .clone()
          .add(9, 'days')
          .endOf('day')
          .toDate();

        toSave.push(
          this.playerQuestRepo.create({
            user: { id: userId },
            quest: lastDaily,
            start_at: startAt,
            end_at: endAt,
          }),
        );
      }

      const others = missingQuests.filter(
        (q) =>
          q.type !== QuestType.NEWBIE_LOGIN &&
          q.type !== QuestType.NEWBIE_LOGIN_SPECIAL,
      );

      for (const quest of others) {
        const { startAt, endAt } = this.calcQuestDuration(firstLoginDay, quest);
        toSave.push(
          this.playerQuestRepo.create({
            user: { id: userId },
            quest,
            start_at: startAt,
            end_at: endAt,
          }),
        );
      }
    }

    const expiredQuests = await this.findExpiredQuests(userId, timezone);

    toSave.push(...expiredQuests);

    if (toSave.length) {
      await this.playerQuestRepo.save(toSave);
    }

    return {
      message: toSave.length ? undefined : 'No quests to initialize or renew',
    };
  }

  async renewQuests(
    userId: string,
    { timezone = 'Asia/Ho_Chi_Minh' }: FinishQuestQueryDto,
  ): Promise<void> {
    const toSave: PlayerQuestEntity[] = [];

    const [newbieLogins, expiredQuests] = await Promise.all([
      this.assignUnsetNewbieLoginQuestTimes(userId, timezone),
      this.findExpiredQuests(userId, timezone),
    ]);

    toSave.push(...expiredQuests, ...newbieLogins);

    if (!toSave.length) return;

    await this.playerQuestRepo.save(toSave);
  }

  async findExpiredQuests(
    userId: string,
    timezone = 'Asia/Ho_Chi_Minh',
  ): Promise<PlayerQuestEntity[]> {
    const firstLoginDay = moment.tz(timezone).startOf('day');
    const now = new Date();
    const expiredQuests = await this.playerQuestRepo.find({
      where: {
        quest: {
          type: Not(
            In([QuestType.NEWBIE_LOGIN, QuestType.NEWBIE_LOGIN_SPECIAL]),
          ),
        },
        user: { id: userId },
        end_at: LessThanOrEqual(now),
      },
      relations: { quest: true },
    });

    if (!expiredQuests.length) return [];

    const toSave: PlayerQuestEntity[] = [];

    for (const pq of expiredQuests) {
      const { startAt, endAt } = this.calcQuestDuration(
        firstLoginDay,
        pq.quest,
      );

      pq.start_at = startAt;
      pq.end_at = endAt;
      pq.is_completed = false;
      pq.completed_at = null;
      pq.is_claimed = false;
      pq.progress_history = [];

      toSave.push(pq);
    }

    return toSave;
  }

  async initQuestsForAllUsers({
    timezone = 'Asia/Ho_Chi_Minh',
  }: FinishQuestQueryDto): Promise<{
    initialized: number;
    renewed: number;
    skipped: number;
  }> {
    const users = await this.userService.find({ select: ['id'] });
    const firstLoginDay = moment.tz(timezone).startOf('day');
    const now = new Date();

    let initialized = 0;
    let renewed = 0;
    let skipped = 0;

    for (const user of users) {
      const userId = user.id;
      const toSave: PlayerQuestEntity[] = [];

      const missingQuests = await this.findMissingQuestsForPlayer(userId);

      if (missingQuests.length) {
        // --- Normal daily newbie login quests ---
        const normalDailies = missingQuests.filter(
          (q) => q.type === QuestType.NEWBIE_LOGIN,
        );

        normalDailies.forEach((quest, idx) => {
          toSave.push(
            this.playerQuestRepo.create({
              user: { id: userId },
              quest,
            }),
          );
        });

        const lastDaily = missingQuests.find(
          (q) => q.type === QuestType.NEWBIE_LOGIN_SPECIAL,
        );

        if (lastDaily) {
          toSave.push(
            this.playerQuestRepo.create({
              user: { id: userId },
              quest: lastDaily,
            }),
          );
        }

        const others = missingQuests.filter(
          (q) =>
            q.type !== QuestType.NEWBIE_LOGIN &&
            q.type !== QuestType.NEWBIE_LOGIN_SPECIAL,
        );

        for (const quest of others) {
          const { startAt, endAt } = this.calcQuestDuration(
            firstLoginDay,
            quest,
          );
          toSave.push(
            this.playerQuestRepo.create({
              user: { id: userId },
              quest,
              start_at: startAt,
              end_at: endAt,
            }),
          );
        }
      }

      const expiredQuests = await this.playerQuestRepo.find({
        where: {
          quest: {
            type: Not(
              In([QuestType.NEWBIE_LOGIN, QuestType.NEWBIE_LOGIN_SPECIAL]),
            ),
          },
          user: { id: userId },
          end_at: LessThanOrEqual(now),
        },
        relations: { quest: true },
      });

      for (const pq of expiredQuests) {
        const { startAt, endAt } = this.calcQuestDuration(
          firstLoginDay,
          pq.quest,
        );

        pq.start_at = startAt;
        pq.end_at = endAt;
        pq.is_completed = false;
        pq.completed_at = null;
        pq.is_claimed = false;
        pq.progress_history = [];

        toSave.push(pq);
      }

      if (toSave.length) {
        await this.playerQuestRepo.save(toSave);
        if (missingQuests.length) initialized++;
        if (expiredQuests.length) renewed++;
      } else {
        skipped++;
      }
    }

    return { initialized, renewed, skipped };
  }

  async checkUnclaimedQuest(
    userId: string,
  ): Promise<{ has_unclaimed: boolean }> {
    // ✅ Check if user has any unclaimed and unexpired quests
    const countUnclaimed = await this.playerQuestRepo.count({
      where: {
        user: { id: userId },
        is_claimed: false,
        is_completed: true,
        quest: {
          type: Not(
            In([QuestType.NEWBIE_LOGIN, QuestType.NEWBIE_LOGIN_SPECIAL]),
          ),
        },
        end_at: MoreThan(new Date()),
      },
    });

    const has_unclaimed = countUnclaimed > 0;

    return {
      has_unclaimed,
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

    if (!playerQuest.is_completed) {
      throw new BadRequestException('Quest not completed yet.');
    }

    if (playerQuest.is_claimed) {
      throw new BadRequestException('Quest is claimed.');
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

    await this.inventoryService.processRewardItems(
      user,
      playerQuest.quest.reward.items,
    );

    playerQuest.is_claimed = true;

    return await this.playerQuestRepo.save(playerQuest);
  }

  async assignUnsetNewbieLoginQuestTimes(
    userId: string,
    timezone: string,
  ): Promise<PlayerQuestEntity[]> {
    const missingQuests = await this.playerQuestRepo.find({
      where: [
        {
          quest: {
            type: In([QuestType.NEWBIE_LOGIN, QuestType.NEWBIE_LOGIN_SPECIAL]),
          },
          user: { id: userId },
          start_at: IsNull(),
        },
        {
          quest: {
            type: In([QuestType.NEWBIE_LOGIN, QuestType.NEWBIE_LOGIN_SPECIAL]),
          },
          user: { id: userId },
          end_at: IsNull(),
        },
      ],
      relations: { quest: true },
    });

    if (!missingQuests.length) return [];

    const toSave: PlayerQuestEntity[] = [];

    const firstLoginDay = moment.tz(timezone).startOf('day');
    const normalDailies = missingQuests.filter(
      (q) => q.quest.type === QuestType.NEWBIE_LOGIN,
    );

    normalDailies.forEach((quest, idx) => {
      const startAt = firstLoginDay.clone().add(idx, 'days').toDate();
      const endAt = firstLoginDay.clone().add(9, 'days').endOf('day').toDate();

      quest.start_at = startAt;
      quest.end_at = endAt;
      toSave.push(quest);
    });

    const lastDaily = missingQuests.find(
      (q) => q.quest.type === QuestType.NEWBIE_LOGIN_SPECIAL,
    );

    if (lastDaily) {
      const startAt = firstLoginDay.clone().add(6, 'days').toDate();
      const endAt = firstLoginDay.clone().add(9, 'days').endOf('day').toDate();
      lastDaily.start_at = startAt;
      lastDaily.end_at = endAt;
      toSave.push(lastDaily);
    }

    return toSave;
  }

  hasCompletedNewbieLoginToday(quests: PlayerQuestEntity[]): boolean {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    return quests.some(
      (pq) =>
        this.isNewbieLoginQuest(pq) &&
        pq.completed_at &&
        pq.completed_at >= startOfToday &&
        pq.completed_at <= endOfToday,
    );
  }

  isNewbieLoginQuest(pq: PlayerQuestEntity): boolean {
    return (
      pq.quest.type === QuestType.NEWBIE_LOGIN ||
      pq.quest.type === QuestType.NEWBIE_LOGIN_SPECIAL
    );
  }

  calcQuestDuration(base: moment.Moment, quest: QuestEntity) {
    let startAt: Date;
    let endAt: Date;

    if (quest.type === QuestType.NEWBIE_LOGIN) {
      // handled separately
      startAt = base.toDate();
      endAt = base.clone().endOf('day').toDate();
    } else if (quest.frequency === QuestFrequency.DAILY) {
      startAt = base.clone().startOf('day').toDate();
      endAt = base.clone().endOf('day').toDate();
    } else if (quest.frequency === QuestFrequency.WEEKLY) {
      startAt = base.clone().startOf('isoWeek').toDate();
      endAt = base.clone().endOf('isoWeek').toDate();
    } else {
      startAt = base.clone().toDate();
      endAt = quest.duration_hours
        ? base.clone().add(quest.duration_hours, 'hours').toDate()
        : base.clone().endOf('day').toDate();
    }

    return { startAt, endAt };
  }
}
