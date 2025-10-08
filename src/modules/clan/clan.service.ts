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
  UpdateClanDto,
} from './dto/clan.dto';
import { ClanEntity } from './entity/clan.entity';

@Injectable()
export class ClanService extends BaseService<ClanEntity> {
  constructor(
    @InjectRepository(ClanEntity)
    private readonly clanRepository: Repository<ClanEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private manager: EntityManager,
  ) {
    super(clanRepository, ClanEntity.name);
  }

  async getAllClansWithMemberCount(query: ClansQueryDto) {
    const {
      page = 1,
      limit = 30,
      sort_by = 'created_at',
      order = 'DESC',
    } = query;

    const [clans, total] = await this.repository
      .createQueryBuilder('clans')
      .loadRelationCountAndMap('clans.member_count', 'clans.members')
      .orderBy(`clans.${sort_by}`, order)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return new Pageable(plainToInstance(ClanListDto, clans), {
      size: limit,
      page,
      total,
    });
  }

  async getClanById(clanId: string) {
    const clanWithCount = await this.createQueryBuilder()
      .leftJoinAndSelect('clans.leader', 'leader')
      .leftJoinAndSelect('clans.vice_leader', 'vice_leader')
      .leftJoin('clans.members', 'members')
      .where('clans.id = :clanId', { clanId })
      .loadRelationCountAndMap('clans.member_count', 'clans.members')
      .getOne();

    if (!clanWithCount) {
      throw new NotFoundException('Clan not found');
    }

    return plainToInstance(ClanInfoResponseDto, clanWithCount);
  }

  async getUsersByClanId(clanId: string, query: UsersClanQueryDto) {
    const {
      page = 1,
      limit = 30,
      search,
      sort_by = 'username',
      order = 'DESC',
    } = query;

    const [users, total] = await this.userRepository.findAndCount({
      where: { clan_id: clanId, username: ILike(`%${search}%`) },
      take: limit,
      skip: (page - 1) * limit,
      order: {
        [sort_by]: order,
      },
    });

    return new Pageable(plainToInstance(UserPublicDto, users), {
      size: limit,
      page,
      total,
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

    user.clan = clan;
    await this.userRepository.update(user.id, { clan });

    return plainToInstance(UserInformationDto, user);
  }

  async leaveClan(user: UserEntity, clanId: string) {
    if (!user.clan_id || user.clan_id !== clanId) {
      throw new BadRequestException('User is not a member of this clan');
    }

    user.clan = null;
    await this.userRepository.update(user.id, { clan: null });

    return plainToInstance(UserInformationDto, user);
  }
}
