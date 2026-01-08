// reward.service.ts
import { FoodEntity } from '@modules/food/entity/food.entity';
import { QuestEntity } from '@modules/quest/entity/quest.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRewardManagementDto, QueryRewardDto } from './dto/reward.dto';
import { BaseService } from '@libs/base/base.service';
import { RewardEntity } from '@modules/reward/entity/reward.entity';
import { ClanService } from '@modules/clan/clan.service';
import { UserService } from '@modules/user/user.service';
import { ClanActivityActionType, ClanFundType, RewardType } from '@enum';
import { ClanFundService } from '@modules/clan-fund/clan-fund.service';
import { CLanWarehouseService } from '@modules/clan-warehouse/clan-warehouse.service';
import { ClanActivityService } from '@modules/clan-activity/clan-activity.service';
import { ClanEntity } from '@modules/clan/entity/clan.entity';

@Injectable()
export class RewardManagementService extends BaseService<RewardEntity> {
  constructor(
    @InjectRepository(RewardEntity)
    private readonly rewardRepo: Repository<RewardEntity>,
    @InjectRepository(QuestEntity)
    private questRepo: Repository<QuestEntity>,
    private clanService: ClanService,
    private clanFundService: ClanFundService,
    private userService: UserService,
    private clanWarehouseService: CLanWarehouseService,
    private clanActivityService: ClanActivityService,
  ) {
    super(rewardRepo, RewardEntity.name);
  }

  async getAll(query: QueryRewardDto) {
    const { description, name, type, food_type, item_type } = query;
    const rewards = await this.rewardRepo.find({
      where: {
        name,
        type,
        description,
        items: { food: { type: food_type }, item: { type: item_type } },
      },
      relations: ['items', 'items.food', 'items.item', 'items.plant'],
    });
    return rewards;
  }

  async getRewardByType(type: RewardType) {
    return await this.rewardRepo.findOne({ 
      where: { type }, 
      relations: ['items', 'items.food', 'items.item', 'items.plant', 'items.pet'],
    });
  }

  async createRewardManagement(payload: CreateRewardManagementDto) {
    const newRewardManagement = this.rewardRepo.create(payload);
    return await this.rewardRepo.save(newRewardManagement);
  }

  async updateRewardManagement(id: string, payload: CreateRewardManagementDto) {
    const reward = await this.findOneNotDeletedById(id);
    Object.assign(reward, payload);

    const updateRewardManagement = await this.save(reward);

    return await this.rewardRepo.save(updateRewardManagement);
  }

  async rewardWeeklyTopMembers() {
    const allClans = await this.clanService.getAllClansWithMemberCount({ isWeekly: true });

    const rewardMap = {
      1: { rewardType: RewardType.WEEKLY_RANKING_MEMBER_1, activityType: ClanActivityActionType.WEEKLY_RANKING_MEMBER_1 },
      2: { rewardType: RewardType.WEEKLY_RANKING_MEMBER_2, activityType: ClanActivityActionType.WEEKLY_RANKING_MEMBER_2 },
      3: { rewardType: RewardType.WEEKLY_RANKING_MEMBER_3, activityType: ClanActivityActionType.WEEKLY_RANKING_MEMBER_3 },
    };

    const rewardedUsers: string[] = [];

    for (const clan of allClans.result.filter(clan => clan.weekly_score > 0)) {
      const topMembers = await this.clanService.getUsersByClanId(clan.id, { page: 1, limit: 10, isWeekly: true });
      if (!topMembers.result.length) continue;

      for (const member of topMembers.result.filter(p => p.weekly_score > 0)) {
        let rewardType: RewardType | undefined;
        let activityType: ClanActivityActionType | undefined;

        if (member.rank >= 1 && member.rank <= 3) {
          rewardType = rewardMap[member.rank].rewardType;
          activityType = rewardMap[member.rank].activityType;
        } else if (member.rank >= 4 && member.rank <= 10) {
          rewardType = RewardType.WEEKLY_RANKING_MEMBER_TOP_10;
          activityType = ClanActivityActionType.WEEKLY_RANKING_MEMBER_TOP_10;
        }
        if (!rewardType || !activityType) continue;

        const user = await this.userService.findById(member.id);
        if (!user) continue;

        user.has_weekly_reward = true;
        user.reward_type = rewardType;

        const updatedUser = await this.userService.save(user);

        await this.clanActivityService.logActivity({
          clanId: clan.id,
          userId: user.id,
          actionType: activityType,
          officeName: `${clan.name} Farm`,
        });

        rewardedUsers.push(updatedUser.username);
      }
    }

    return rewardedUsers;
  }

  async rewardWeeklyTopClans() {
    const topClans = await this.clanService.getAllClansWithMemberCount({ page: 1, limit: 3, isWeekly: true });

    const rewardMap = {
      1: { rewardType: RewardType.WEEKLY_RANKING_CLAN_1, activityType: ClanActivityActionType.WEEKLY_RANKING_CLAN_1 },
      2: { rewardType: RewardType.WEEKLY_RANKING_CLAN_2, activityType: ClanActivityActionType.WEEKLY_RANKING_CLAN_2 },
      3: { rewardType: RewardType.WEEKLY_RANKING_CLAN_3, activityType: ClanActivityActionType.WEEKLY_RANKING_CLAN_3 },
    };

    const rewardedClans: ClanEntity[] = [];

    for (const clan of topClans.result.filter(clan => clan.weekly_score > 0)) {
      const rewardType = rewardMap[clan.rank].rewardType;
      const activityType = rewardMap[clan.rank].activityType;
      if (!rewardType || !activityType) continue;

      const reward = await this.getRewardByType(rewardType);
      if (!reward) continue;

      for (const item of reward.items) {
        if (item.type === 'gold' || item.type === 'diamond') {
          await this.clanFundService.rewardClanFund(clan.id, {
            type: item.type === 'gold' ? ClanFundType.GOLD : ClanFundType.DIAMOND,
            amount: item.quantity,
          });
        }
        if (item.type === 'plant' && item.plant) {
          await this.clanWarehouseService.rewardSeedToClans(clan.id, item.plant.id, item.quantity);
        }
      }

      await this.clanActivityService.logActivity({
        clanId: clan.id,
        actionType: activityType,
        officeName: `${clan.name} Farm`,
      });

      rewardedClans.push(clan);
    }

    return rewardedClans;
  }
}
