// reward.service.ts
import { FoodEntity } from '@modules/food/entity/food.entity';
import { QuestEntity } from '@modules/quest/entity/quest.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRewardManagementDto, QueryRewardDto } from './dto/reward.dto';
import { BaseService } from '@libs/base/base.service';
import { RewardEntity } from '@modules/reward/entity/reward.entity';
import { InventoryService } from '@modules/inventory/inventory.service';
import { ClanService } from '@modules/clan/clan.service';
import { UserService } from '@modules/user/user.service';
import { ClanFundType, RewardType } from '@enum';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ClanFundService } from '@modules/clan-fund/clan-fund.service';
import { CLanWarehouseService } from '@modules/clan-warehouse/clan-warehouse.service';

@Injectable()
export class RewardManagementService extends BaseService<RewardEntity> {
  constructor(
    @InjectRepository(RewardEntity)
    private readonly rewardRepo: Repository<RewardEntity>,
    @InjectRepository(QuestEntity)
    private questRepo: Repository<QuestEntity>,
    private inventoryService: InventoryService,
    private clanService: ClanService,
    private clanFundService: ClanFundService,
    private userService: UserService,
    private clanWarehouseService: CLanWarehouseService,
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
      1: RewardType.WEEKLY_RANKING_MEMBER_1,
      2: RewardType.WEEKLY_RANKING_MEMBER_2,
      3: RewardType.WEEKLY_RANKING_MEMBER_3,
    };

    for (const clan of allClans.result) {
      const topMembers = await this.clanService.getUsersByClanId(clan.id, { page: 1, limit: 10 });

      for (const member of topMembers.result.filter(p => p.weekly_score > 0)) {
        let rewardType: RewardType | undefined;

        if (member.rank >= 1 && member.rank <= 3) {
          rewardType = rewardMap[member.rank];
        } else if (member.rank >= 4 && member.rank <= 10) {
          rewardType = RewardType.WEEKLY_RANKING_MEMBER_TOP_10;
        }

        if (!rewardType) continue;

        const reward = await this.getAll({ type: rewardType })[0];
        if (!reward) continue;

        const user = await this.userService.findById(member.id);
        if (!user) continue;

        await this.inventoryService.processRewardItems(user, reward.items);
      }
    }
  }

  async rewardWeeklyTopClans() {
    const topClans = await this.clanService.getAllClansWithMemberCount({ page: 1, limit: 3, isWeekly: true });

    const rewardMap = {
      1: RewardType.WEEKLY_RANKING_CLAN_1,
      2: RewardType.WEEKLY_RANKING_CLAN_2,
      3: RewardType.WEEKLY_RANKING_CLAN_3,
    };

    for (const clan of topClans.result.filter(clan => clan.weekly_score > 0)) {
      const rewardType = rewardMap[clan.rank];
      if (!rewardType) continue;

      const reward = await this.getAll({ type: rewardType })[0];
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
    }
    return topClans;
  }
}
