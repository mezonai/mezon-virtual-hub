import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ClanFundEntity } from './entity/clan-fund.entity';
import {
  ContributeClanFundDto,
  ContributorClanFundQueryDto,
} from './dto/clan-fund.dto';
import { ClanFundTransactionEntity } from './entity/clan-fund-transaction.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { Pageable } from '@types';
import { ClanRole } from '@enum';

@Injectable()
export class ClanFundService {
  constructor(
    @InjectRepository(ClanFundEntity)
    private readonly clanFundRepo: Repository<ClanFundEntity>,
    @InjectRepository(ClanEntity)
    private readonly clanRepo: Repository<ClanEntity>,
    @InjectRepository(ClanFundTransactionEntity)
    private readonly clanFundTransactionRepo: Repository<ClanFundTransactionEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async contribute(
    clanId: string,
    user: UserEntity,
    dto: ContributeClanFundDto,
  ) {
    if (user.clan_id !== clanId) {
      throw new BadRequestException('User does not belong to this clan');
    }

    const existedClan = await this.clanRepo.findOne({
      where: {
        id: clanId,
      },
    });

    if (!existedClan) {
      throw new NotFoundException(`Clan ${clanId} not found`);
    }

    return this.dataSource.transaction(async (manager) => {
      const { type, amount } = dto;
      const clanFundRepo = manager.getRepository(ClanFundEntity);
      const clanFundTransactionRepo = manager.getRepository(
        ClanFundTransactionEntity,
      );
      const userRepo = manager.getRepository(UserEntity);

      // 1️⃣ Reload user inside transaction (to avoid stale data)
      const currentUser = await userRepo.findOne({
        where: { id: user.id },
        lock: { mode: 'pessimistic_write', tables: ['user'] },
      });

      if (!currentUser) {
        throw new NotFoundException('User not found');
      }

      // 2️⃣ Check if user has enough balance
      if (type === 'gold' && currentUser.gold < amount) {
        throw new BadRequestException('Not enough gold to contribute');
      }

      if (type === 'diamond' && currentUser.diamond < amount) {
        throw new BadRequestException('Not enough diamond to contribute');
      }

      // 3️⃣ Deduct balance
      if (type === 'gold') {
        currentUser.gold -= amount;
      } else if (type === 'diamond') {
        currentUser.diamond -= amount;
      }

      await userRepo.save(currentUser);

      let fund = await clanFundRepo.findOne({
        where: { clan_id: clanId, type },
        lock: { mode: 'pessimistic_write', tables: ['clan_funds'] },
      });

      if (!fund) {
        fund = clanFundRepo.create({ clan_id: clanId, type, amount: 0 });
      }

      fund.amount += amount;
      await clanFundRepo.save(fund);

      // 2. Record the transaction
      const transaction = clanFundTransactionRepo.create({
        clan_id: clanId,
        user_id: user.id,
        type,
        amount,
      });
      await clanFundTransactionRepo.save(transaction);

      return fund;
    });
  }

  async getClanFundInfo(clanId: string) {
    const funds = await this.clanFundRepo.find({
      where: { clan_id: clanId },
      order: { type: 'ASC' },
    });

    if (!funds.length) {
      return { clan_id: clanId, funds: [], total: 0 };
    }

    return {
      clan_id: clanId,
      funds: funds.map((f) => ({
        type: f.type,
        amount: f.amount,
      })),
    };
  }

  async getClanContributors(
    clanId: string,
    query: ContributorClanFundQueryDto,
  ) {
    const { search, page = 1, limit = 10 } = query;

    const clan = await this.clanRepo.findOne({
      where: { id: clanId },
    });

    if (!clan) {
      throw new NotFoundException('Clan not found');
    }

    const qb = this.clanFundTransactionRepo
      .createQueryBuilder('tx')
      .where('tx.clan_id = :clanId', { clanId })
      .select('tx.user_id', 'user_id')
      .addSelect('SUM(tx.amount)', 'total_amount')
      .addSelect('tx.type', 'type')
      .innerJoin('user', 'u', 'u.id = tx.user_id AND u.clan_id = tx.clan_id')
      .groupBy('tx.user_id, tx.type, u.username, u.clan_role, u.avatar_url')
      .addSelect('u.username', 'username')
      .addSelect('u.avatar_url', 'avatar_url')
      .addSelect('u.clan_role', 'clan_role');

    if (search) {
      qb.andWhere('u.username ILIKE :search', { search: `%${search}%` });
    }

    qb.orderBy(
      `
        CASE 
          WHEN u.clan_role = '${ClanRole.LEADER}' THEN 1
          WHEN u.clan_role = '${ClanRole.VICE_LEADER}' THEN 2
          ELSE 3
        END
      `,
      'ASC',
    ).addOrderBy('total_amount', 'DESC');

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await Promise.all([qb.getRawMany(), qb.getCount()]);

    return new Pageable(data, {
      size: limit,
      page,
      total,
    });
  }
}
