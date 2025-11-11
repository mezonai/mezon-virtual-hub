import { BaseService } from '@libs/base/base.service';
import {
  UserInformationDto,
  UserPublicDto,
  UsersClanQueryDto,
} from '@modules/user/dto/user.dto';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pageable } from '@types';
import { plainToInstance } from 'class-transformer';
import { EntityManager, ILike, Repository } from 'typeorm';
import {
  ClanInfoResponseDto,
  ClanListDto,
  ClansQueryDto,
  UpdateClanDescriptionDto,
  UpdateClanDto,
} from './dto/clan.dto';
import { ClanEntity } from './entity/clan.entity';
import { ClanRequestService } from '@modules/clan-request/clan-request.service';
import { ClanRequestStatus } from '@enum';
import { ClanRequestEntity } from '@modules/clan-request/entity/clan-request.entity';
import { ClanRole } from '@enum';
import { UserClanStatEntity } from '@modules/user-clan-stat/entity/user-clan-stat.entity';

@Injectable()
export class ClanService extends BaseService<ClanEntity> {
  constructor(
    @InjectRepository(ClanEntity)
    private readonly clanRepository: Repository<ClanEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly clanRequestService: ClanRequestService,
    @InjectRepository(ClanRequestEntity)
    private readonly clanRequestRepository: Repository<ClanRequestEntity>,
    @InjectRepository(UserClanStatEntity)
    private readonly userClantStatRepo: Repository<UserClanStatEntity>,
    private manager: EntityManager,
  ) {
    super(clanRepository, ClanEntity.name);
  }

  async getAllClansWithMemberCount(query: ClansQueryDto) {
    const { page = 1, limit = 30, search } = query;

    const qb = this.repository
      .createQueryBuilder('clans')
      .loadRelationCountAndMap('clans.member_count', 'clans.members');

    if (search) {
      qb.where('LOWER(clans.name) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    const clans = await qb.getMany();

    const clansSorted = clans.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    let currentRank = 1;
    const clansWithRank = clansSorted.map((c) => {
      const rank = c.score > 0 ? currentRank++ : 0;
      return {
        ...plainToInstance(ClanListDto, c),
        rank,
      };
    });

    const start = (page - 1) * limit;
    const end = start + limit;
    const pagedClans = clansWithRank.slice(start, end);

    return new Pageable(pagedClans, {
      size: limit,
      page,
      total: clansWithRank.length,
    });
  }

  async getAllClansWithMemberRequest(user: UserEntity, query: ClansQueryDto) {
    const {
      page = 1,
      limit = 30,
      sort_by = 'created_at',
      order = 'DESC',
      search,
    } = query;

    const qb = this.repository
      .createQueryBuilder('clans')
      .loadRelationCountAndMap('clans.member_count', 'clans.members');

    if (search) {
      qb.where('LOWER(clans.name) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    const [clans, total] = await qb
      .orderBy(`clans.${sort_by}`, order)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    let latestRequestMap = new Map<string, ClanRequestStatus>();

    if (user?.id) {
      const requests = await this.clanRequestRepository
        .createQueryBuilder('req')
        .select(['req.clan_id', 'req.status'])
        .where('req.user_id = :userId', { userId: user.id })
        .andWhere('req.processed_at IS NULL')
        .orderBy('req.created_at', 'DESC')
        .getMany();

      for (const r of requests) {
        if (!latestRequestMap.has(r.clan_id)) {
          latestRequestMap.set(r.clan_id, r.status);
        }
      }
    }

    const result = clans.map((clan) => {
      const join_status = latestRequestMap.get(clan.id) ?? null;
      return { ...clan, join_status };
    });

    return new Pageable(plainToInstance(ClanListDto, result), {
      size: limit,
      page,
      total,
    });
  }

  async getClanById(clanId: string) {
    const clanWithCount = await this.createQueryBuilder()
      .loadRelationCountAndMap('clans.member_count', 'clans.members')
      .where('clans.id = :clanId', { clanId })
      .getOne();

    if (!clanWithCount) {
      throw new NotFoundException('Clan not found');
    }

    const totalScore = await this.calculateClanScore(clanId);
    clanWithCount.score = totalScore.totalScore;
    const totalFund =
      clanWithCount.funds?.reduce((sum, fund) => sum + (fund.amount || 0), 0) ||
      0;
    clanWithCount.fund = totalFund;

    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.clan_id = :clanId', { clanId })
      .andWhere('user.clan_role IN (:...roles)', {
        roles: [ClanRole.LEADER, ClanRole.VICE_LEADER],
      })
      .getMany();

    const leader = users.find((u) => u.clan_role === ClanRole.LEADER) || null;
    const viceLeader =
      users.find((u) => u.clan_role === ClanRole.VICE_LEADER) || null;

    // clanWithCount['leader'] = leader;
    // clanWithCount['vice_leader'] = viceLeader;

    clanWithCount['leader'] = {
      ...plainToInstance(UserInformationDto, leader),
      total_score: leader?.scores?.[0]?.total_score ?? 0,
      weekly_score: leader?.scores?.[0]?.weekly_score ?? 0,
    };

    clanWithCount['vice_leader'] = {
      ...plainToInstance(UserInformationDto, viceLeader),
      total_score: viceLeader?.scores?.[0]?.total_score ?? 0,
      weekly_score: viceLeader?.scores?.[0]?.weekly_score ?? 0,
    };

    return plainToInstance(ClanInfoResponseDto, clanWithCount);
  }

  async getUsersByClanId(clanId: string, query: UsersClanQueryDto) {
    const { page = 1, limit = 30, search } = query;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.scores', 'score', 'score.clan_id = :clanId', {
        clanId,
      })
      .where('user.clan_id = :clanId', { clanId });

    if (search) {
      qb.andWhere('user.username ILIKE :search', { search: `%${search}%` });
    }

    const users = await qb.getMany();

    const usersSortedByScore = [...users].sort((a, b) => {
      const scoreA = a.scores?.[0]?.total_score ?? 0;
      const scoreB = b.scores?.[0]?.total_score ?? 0;
      return scoreB - scoreA;
    });

    let currentRank = 1;
    const usersWithRank = usersSortedByScore.map((u) => {
      const score = u.scores?.[0]?.total_score ?? 0;
      const weekly_score = u.scores?.[0]?.weekly_score ?? 0;
      const rank = score > 0 ? currentRank++ : 0;
      return {
        ...plainToInstance(UserPublicDto, u),
        total_score: score,
        weekly_score,
        rank,
      };
    });

    const leaders = usersWithRank.filter(
      (u) =>
        u.clan_role === ClanRole.LEADER || u.clan_role === ClanRole.VICE_LEADER,
    );
    const members = usersWithRank.filter(
      (u) =>
        u.clan_role !== ClanRole.LEADER && u.clan_role !== ClanRole.VICE_LEADER,
    );

    const finalList = [...leaders, ...members];

    const start = (page - 1) * limit;
    const end = start + limit;
    const pagedUsers = finalList.slice(start, end);

    return new Pageable(pagedUsers, {
      size: limit,
      page,
      total: finalList.length,
    });
  }

  async updateClan(id: string, mapData: UpdateClanDto) {
    const map = await this.clanRepository.findOne({ where: { id } });
    if (!map) {
      throw new NotFoundException(`Clan with ID ${id} not found`);
    }

    const filteredData = Object.fromEntries(
      Object.entries(mapData).filter(
        ([_, value]) => value !== null && value !== undefined,
      ),
    );

    Object.assign(map, filteredData);

    return this.clanRepository.update({ id }, map);
  }

  async deleteClan(id: string) {
    const result = await this.clanRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Clan not found');
    }
    return { deleted: true };
  }

  async joinClan(user: UserEntity, clanId: string) {
    if (user.clan_id) {
      throw new BadRequestException('User already belongs to a clan');
    }

    const clan = await this.findById(clanId);
    if (!clan) {
      throw new NotFoundException('Clan not found');
    }
    return await this.clanRequestService.requestToJoin(user, clan);
  }

  async cancelJoinClan(user: UserEntity, clanId: string) {
    const clan = await this.findById(clanId);
    if (!clan) {
      throw new NotFoundException('Clan not found');
    }
    return await this.clanRequestService.cancelJoinRequest(user.id, clan.id);
  }

  async leaveClan(user: UserEntity) {
    if (user.clan_role === ClanRole.LEADER) {
      throw new BadRequestException(
        'Leader must transfer role before leaving the clan.',
      );
    }

    const oldClanId = user.clan_id;

    user.clan = null;
    user.clan_role = ClanRole.MEMBER;
    user.time_leave_clan = new Date();
    await this.userRepository.update(user.id, {
      clan: null,
      time_leave_clan: user.time_leave_clan,
      clan_role: ClanRole.MEMBER,
    });

    if (oldClanId) {
      await this.userClantStatRepo.update(
        { user_id: user.id, clan_id: oldClanId },
        { deleted_at: new Date() },
      );
    }

    return plainToInstance(UserInformationDto, user);
  }

  async updateClanDescription(clanId: string, dto: UpdateClanDescriptionDto) {
    const clan = await this.clanRepository.findOne({
      where: { id: clanId },
    });

    if (!clan) {
      throw new NotFoundException(`Clan with ID ${clanId} not found`);
    }

    clan.description = dto.description;
    await this.clanRepository.save(clan);

    return {
      success: true,
      description: clan.description,
    };
  }

  async calculateClanScore(clanId: string) {
    const totalScoreRaw = await this.userClantStatRepo
      .createQueryBuilder('stats')
      .withDeleted()
      .select('SUM(stats.total_score)', 'total_score')
      .addSelect('SUM(stats.weekly_score)', 'weekly_score')
      .where('stats.clan_id = :clanId', { clanId })
      .getRawOne();
    const totalScore = parseInt(totalScoreRaw?.total_score ?? '0', 10);
    await this.clanRepository.update(clanId, { score: totalScore });
    return { totalScore };
  }

  async setUserClanAndRole(userId: string, clanId: string, role: ClanRole) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User not found`);

    const clan = await this.findById(clanId);
    if (!clan) throw new NotFoundException(`Clan not found`);

    if (user.clan_id && user.clan_id !== clanId) {
      await this.userRepository.update(userId, {
        clan_id: null,
        clan_role: ClanRole.MEMBER,
      });

      await this.userClantStatRepo.update(
        { user_id: userId, clan_id: user.clan_id },
        { deleted_at: new Date() },
      );
    }

    if (role === ClanRole.LEADER || role === ClanRole.VICE_LEADER) {
      const current = await this.userRepository.findOne({
        where: { clan_id: clanId, clan_role: role },
      });
      if (current && current.id !== userId) {
        await this.userRepository.update(current.id, {
          clan_role: ClanRole.MEMBER,
        });
      }
    }

    await this.userRepository.update(userId, {
      clan_id: clanId,
      clan_role: role,
    });

    let stat = await this.userClantStatRepo.findOne({
      where: { user_id: userId, clan_id: clanId },
    });

    if (!stat) {
      stat = this.userClantStatRepo.create({
        user_id: userId,
        clan_id: clanId,
        total_score: 0,
        weekly_score: 0,
        harvest_count: 10,
        harvest_count_use: 0,
        harvest_interrupt_count: 10,
        harvest_interrupt_count_use: 0,
        created_at: new Date(),
      });
      await this.userClantStatRepo.save(stat);
    }

    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    return {
      success: true,
      user: plainToInstance(UserInformationDto, updatedUser),
    };
  }
}
