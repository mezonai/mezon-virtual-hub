import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@modules/user/entity/user.entity';
import { UserClanStatEntity } from '@modules/user-clan-stat/entity/user-clan-stat.entity';
import { ClanWarehouseEntity } from '@modules/clan-warehouse/entity/clan-warehouse.entity';
import { ClanFundTransactionEntity } from '@modules/clan-fund/entity/clan-fund-transaction.entity';
import { SlotsPlantEntity } from '@modules/slots-plant/entity/slots-plant.entity';
import { ClanActivityDto, ClansQueryDto } from './dto/clan.dto';
import { Pageable } from '@types';
import { ClanActivityActionType } from '@enum';

@Injectable()
export class ClanActivityService {
  constructor(
    @InjectRepository(UserClanStatEntity)
    private readonly userClanStatRepo: Repository<UserClanStatEntity>,
    @InjectRepository(ClanWarehouseEntity)
    private readonly clanWarehouseRepo: Repository<ClanWarehouseEntity>,
    @InjectRepository(ClanFundTransactionEntity)
    private readonly clanFundRepo: Repository<ClanFundTransactionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(SlotsPlantEntity)
    private readonly slotsPlantRepo: Repository<SlotsPlantEntity>,
  ) {}

  private formatTime(date: Date): string { return date.toLocaleString('vi-VN', { hour12: false }); }

  async getClanActivity(
    clanId: string,
    query: ClansQueryDto,
  ): Promise<Pageable<ClanActivityDto>> {
    const { page = 1, limit = 30 } = query;
    const data: ClanActivityDto[] = [];

    
    // --- User join/leave ---
    const clanStats = await this.userClanStatRepo.find({
      where: { clan_id: clanId },
      relations: ['user'],
    });

    for (const stat of clanStats) {
      const userName = stat.user?.display_name || 'Người chơi';
      if (stat.created_at) {
        data.push({
          userName,
          actionType: ClanActivityActionType.JOIN,
          time: this.formatTime(stat.created_at),
          createdAt: stat.created_at,
        });
      }
      if (stat.deleted_at) {
        data.push({
          userName,
          actionType: ClanActivityActionType.LEAVE,
          time: this.formatTime(stat.deleted_at),
          createdAt: stat.deleted_at,
        });
      }
    }

    // --- Harvested plants ---
    const harvestedPlants = await this.slotsPlantRepo
      .createQueryBuilder('sp')
      .withDeleted()
      .innerJoin('sp.farmSlot', 'fs')
      .innerJoin('fs.farm', 'f')
      .leftJoinAndSelect('sp.plant', 'p')
      .leftJoinAndSelect('sp.plantedByUser', 'u')
      .where('f.clan_id = :clanId', { clanId })
      .orderBy('sp.harvest_at', 'DESC')
      .getMany();

    for (const sp of harvestedPlants) {
      if (!sp.harvest_at) continue;

      const userName =
        sp.last_harvested_by
          ? (await this.userRepo.findOne({ where: { id: sp.last_harvested_by } }))?.display_name || 'Người chơi'
          : 'Thành viên văn phòng';

      data.push({
        userName,
        actionType: ClanActivityActionType.HARVEST,
        itemName: sp.plant?.name ?? 'vật phẩm',
        time: this.formatTime(sp.harvest_at),
        createdAt: sp.harvest_at,
      });
    }

    // --- Warehouse items ---
    const warehouseItems = await this.clanWarehouseRepo.find({
      where: { clan_id: clanId },
      relations: ['plant'],
    });

    for (const item of warehouseItems) {
      if (!item.is_harvested) {
        let userName = 'Giám đốc văn phòng';
        if (item.purchased_by) {
          const user = await this.userRepo.findOne({ where: { id: item.purchased_by } });
          if (user) userName = user.display_name || userName;
        }

        data.push({
          userName,
          actionType: ClanActivityActionType.PURCHASE,
          itemName: item.plant?.name ?? 'vật phẩm',
          quantity: item.quantity,
          time: this.formatTime(item.updated_at),
          createdAt: item.updated_at,
        });
      }
    }

    // --- Clan fund transactions ---
    const fundTx = await this.clanFundRepo.find({
      where: { clan_id: clanId },
      relations: ['user'],
    });

    for (const tx of fundTx) {
      data.push({
        userName: tx.user?.display_name || 'Thành viên văn phòng',
        actionType: ClanActivityActionType.FUND,
        amount: tx.amount,
        time: this.formatTime(tx.created_at),
        createdAt: tx.created_at,
      });
    }

    // --- Sort by date DESC ---
    data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // --- Pagination ---
    const totalItems = data.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const pageInfo = data.slice(start, end);

    return new Pageable(pageInfo, {
      page,
      size: limit,
      total: totalItems,
    });
  }
}
