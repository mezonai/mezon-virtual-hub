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
import { ClanActivityActionType, ClanRequestStatus } from '@enum';
import { ClanRequestEntity } from '@modules/clan-request/entity/clan-request.entity';

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
    @InjectRepository(ClanRequestEntity)
    private readonly clanRequestRepo: Repository<ClanRequestEntity>,
  ) {}

  private formatTime(date: Date): string {
    return date.toLocaleString('vi-VN', { hour12: false });
  }

  async getClanActivity(
    clanId: string,
    query: ClansQueryDto,
  ): Promise<Pageable<ClanActivityDto>> {
    const { page = 1, limit = 30 } = query;
    const data: ClanActivityDto[] = [];

   const clanRequests = await this.clanRequestRepo.find({
     where: { clan_id: clanId, status: ClanRequestStatus.APPROVED },
     relations: ['user'],
     withDeleted: true,
   });

   for (const request of clanRequests) {
     const userName = request.user?.display_name || 'Ai đó';

     if (request.processed_at) {
       data.push({
         userName,
         actionType: ClanActivityActionType.JOIN,
         time: this.formatTime(request.processed_at),
         createdAt: request.processed_at,
       });
     }
   }

    // --- User leave ---
    const clanStats = await this.userClanStatRepo.find({
      where: { clan_id: clanId },
      relations: ['user'],
      withDeleted: true,
    });

    for (const stat of clanStats) {
      const userName = stat.user?.display_name || 'Ai đó';
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
    const clanMembers = await this.userRepo.find({
      where: { clan_id: clanId },
    });
    const memberIds = new Set(clanMembers.map((m) => m.id));
    if (memberIds.size > 0) {
      const harvestedByVictimClan = await this.slotsPlantRepo
        .createQueryBuilder('sp')
        .withDeleted()
        .innerJoin('sp.farmSlot', 'fs')
        .innerJoin('fs.farm', 'f')
        .leftJoinAndSelect('sp.plant', 'p')
        .leftJoinAndSelect('sp.plantedByUser', 'u')
        .addSelect(['f.name'])
        .where('f.clan_id = :clanId', { clanId })
        .orderBy('sp.harvest_at', 'DESC')
        .getMany();

      for (const sp of harvestedByVictimClan) {
        if (!sp.harvest_at) continue;

        let userName = sp.plantedByUser?.display_name ?? 'Ai đó';
        let actionType = ClanActivityActionType.HARVEST;
        let harvesterFarmName = 'nông trại';
        if (sp.last_harvested_by && !memberIds.has(sp.last_harvested_by)) {
          const harvester = await this.userRepo.findOne({
            where: { id: sp.last_harvested_by },
            relations: ['clan', 'clan.farm'],
          });
          userName = harvester?.display_name ?? 'Ai đó';
          actionType = ClanActivityActionType.HARVEST_INTRUDER;
          harvesterFarmName = harvester?.clan?.farm?.name ?? 'nông trại';
        }

        data.push({
          userName,
          actionType,
          itemName: sp.plant?.name ?? 'vật phẩm',
          time: this.formatTime(sp.harvest_at),
          createdAt: sp.harvest_at,
          officeName: harvesterFarmName,
        });
      }

      const harvestedByClanMembers = await this.slotsPlantRepo
        .createQueryBuilder('sp')
        .withDeleted()
        .leftJoinAndSelect('sp.plant', 'p')
        .leftJoinAndSelect('sp.plantedByUser', 'u')
        .innerJoinAndSelect('sp.farmSlot', 'fs')
        .innerJoinAndSelect('fs.farm', 'f')
        .addSelect(['f.name'])
        .where('sp.last_harvested_by IN (:...memberIds)', {
          memberIds: Array.from(memberIds),
        })
        .andWhere('f.clan_id != :clanId', { clanId })
        .orderBy('sp.harvest_at', 'DESC')
        .getMany();

      for (const sp of harvestedByClanMembers) {
        if (!sp.harvest_at) continue;

        const harvester = await this.userRepo.findOne({
          where: { id: sp.last_harvested_by },
        });
        const userName = harvester?.display_name ?? 'Ai đó';

        data.push({
          userName,
          actionType: ClanActivityActionType.HARVESTED_OTHER_FARM,
          itemName: sp.plant?.name ?? 'vật phẩm',
          time: this.formatTime(sp.harvest_at),
          createdAt: sp.harvest_at,
          officeName: sp.farmSlot?.farm?.name ?? 'nông trại',
        });
      }
    }

    // --- Warehouse items ---
    const warehouseItems = await this.clanWarehouseRepo.find({
      where: { clan_id: clanId },
      relations: ['plant'],
    });

    for (const item of warehouseItems) {
      if (!item.is_harvested) {
        let userName = 'Văn phòng được tặng';
        if (item.purchased_by) {
          const user = await this.userRepo.findOne({
            where: { id: item.purchased_by },
          });
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
        userName: tx.user?.display_name || 'Ai đó',
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
