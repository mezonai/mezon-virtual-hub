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
      relations: ['items', 'items.food', 'items.item'],
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

  async rewardWeeklyTopPlayers() {
    const allClans = await this.clanService.getAllClansWithMemberCount({ isWeekly: true });
    for (const clan of allClans.result) {
      const topPlayers = await this.clanService.getUsersByClanId(clan.id, { page: 1, limit: 10 });

      const rewardTop1 = await this.getAll({ type: RewardType.WEEKLY_RANKING_MEMBER_1 });
      const rewardTop2 = await this.getAll({ type: RewardType.WEEKLY_RANKING_MEMBER_2 });
      const rewardTop3 = await this.getAll({ type: RewardType.WEEKLY_RANKING_MEMBER_3 });
      const rewardTop10 = await this.getAll({ type: RewardType.WEEKLY_RANKING_MEMBER_TOP_10 });

      for (const player of topPlayers.result.filter(p => p.weekly_score > 0)) {
        const user = await this.userService.findById(player.id);

        switch (player.rank) {
          case 1:
            await this.inventoryService.processRewardItems(user!, rewardTop1[0].items);
            break;
          case 2:
            await this.inventoryService.processRewardItems(user!, rewardTop2[0].items);
            break;
          case 3:
            await this.inventoryService.processRewardItems(user!, rewardTop3[0].items);
            break;
          default:
            await this.inventoryService.processRewardItems(user!, rewardTop10[0].items);
            break;
        }
      }
    }
  }

  async rewardWeeklyTopClans() {
    const topClans = await this.clanService.getAllClansWithMemberCount({ page: 1, limit: 3, isWeekly: true });

    for (const clan of topClans.result.filter(clan => clan.weekly_score > 0)) {
      switch (clan.rank) {
        case 1:
          await this.clanFundService.rewardClanFund(clan.id, { type: ClanFundType.GOLD, amount: 10000 });
          break;
        case 2:
          await this.clanFundService.rewardClanFund(clan.id, { type: ClanFundType.GOLD, amount: 5000 });
          break;
        case 3:
          await this.clanFundService.rewardClanFund(clan.id, { type: ClanFundType.GOLD, amount: 3000 });
          break;
        default:
          break;
      }
    }
    return topClans;
  }
}
