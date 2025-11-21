import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserEntity } from '@modules/user/entity/user.entity';
import { UserClanStatEntity } from '@modules/user-clan-stat/entity/user-clan-stat.entity';
import { ClanWarehouseEntity } from '@modules/clan-warehouse/entity/clan-warehouse.entity';
import { ClanFundTransactionEntity } from '@modules/clan-fund/entity/clan-fund-transaction.entity';
import { SlotsPlantEntity } from '@modules/slots-plant/entity/slots-plant.entity';
import { Pageable } from '@types';
import { ClanActivityActionType, ClanRequestStatus } from '@enum';
import { ClanRequestEntity } from '@modules/clan-request/entity/clan-request.entity';
import { ClanActivityDto, ClansQueryDto } from '@modules/clan/dto/clan.dto';
import { ClanActivityEntity } from './entity/clan-activity.entity';

@Injectable()
export class ClanActivityService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(ClanActivityEntity)
    private readonly clanActivityRepo: Repository<ClanActivityEntity>,
  ) {}

  private formatTime(date: Date): string {
    return new Date(date.getTime() + 7 * 3600_000).toLocaleString('vi-VN', {
      hour12: false,
    });
  }

  async logActivity(params: {
    clanId: string;
    userId?: string;
    actionType: ClanActivityActionType;
    itemName?: string;
    quantity?: number;
    amount?: number;
    officeName?: string;
  }) {
    const activity = this.clanActivityRepo.create({
      clan_id: params.clanId,
      user_id: params.userId,
      action_type: params.actionType,
      item_name: params.itemName,
      quantity: params.quantity,
      amount: params.amount,
      office_name: params.officeName,
    });

    return this.clanActivityRepo.save(activity);
  }

  async getClanActivity(
    clanId: string,
    query: ClansQueryDto,
  ): Promise<Pageable<ClanActivityDto>> {
    const { page = 1, limit = 30 } = query;

    const [logs, total] = await this.clanActivityRepo.findAndCount({
      where: { clan_id: clanId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const userIds = logs
      .map((log) => log.user_id)
      .filter((id): id is string => !!id);

    const users = await this.userRepo.find({
      where: { id: In(userIds) },
    });

    const userMap = new Map(users.map((u) => [u.id, u.display_name]));

    const data: ClanActivityDto[] = logs.map((log) => ({
      userName: userMap.get(log.user_id ?? '') ?? 'Ai đó',
      actionType: log.action_type as ClanActivityActionType,
      itemName: log.item_name,
      quantity: log.quantity,
      amount: log.amount,
      officeName: log.office_name,
      time: this.formatTime(log.created_at),
      createdAt: log.created_at,
    }));

    return new Pageable(data, { page, size: limit, total });
  }
}
