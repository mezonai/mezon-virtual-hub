import { ClanRequestStatus } from '@enum';
import { BaseService } from '@libs/base/base.service';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { ClanBroadcastEventType } from '@modules/shared/events/event-types.enum';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Pageable } from '@types';
import { plainToInstance } from 'class-transformer';
import { ILike, Repository } from 'typeorm';
import {
  ClanRequestListDto,
  PendingRequestQueryDto,
} from './dto/clan-request.dto';
import { ClanRequestEntity } from './entity/clan-request.entity';
import { UserClanStatEntity } from '@modules/user-clan-stat/entity/user-clan-stat.entity';
import { FARM_CONFIG } from '@constant/farm.constant';

@Injectable()
export class ClanRequestService extends BaseService<ClanRequestEntity> {
  private static readonly CANCEL_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 1 day
  constructor(
    @InjectRepository(ClanRequestEntity)
    private readonly clanRequestRepo: Repository<ClanRequestEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserClanStatEntity)
    private readonly userClantStatRepo: Repository<UserClanStatEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super(clanRequestRepo, ClanRequestEntity.name);
  }

  async requestToJoin(user: UserEntity, clan: ClanEntity) {
    const existingRequest = await this.clanRequestRepo.findOne({
      where: {
        user_id: user.id,
        clan_id: clan.id,
        status: ClanRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('Already requested to join this clan');
    }

    if (user.clan_id) {
      throw new BadRequestException('You are already in a clan');
    }

    const request = this.clanRequestRepo.create({
      user_id: user.id,
      clan_id: clan.id,
      status: ClanRequestStatus.PENDING,
    });

    const updatedRequest = await this.clanRequestRepo.save(request);

    this.eventEmitter.emitAsync(ClanBroadcastEventType.JOIN_REQUEST, {
      clan,
      user,
    });

    return updatedRequest;
  }

  async approveRequest(
    leaderId: string,
    requestId: string,
    isApproved: boolean,
  ) {
    const request = await this.clanRequestRepo.findOne({
      where: { id: requestId },
      relations: ['clan', 'user'],
    });

    if (!request) throw new NotFoundException('Join request not found');

    const { clan } = request;

    request.processed_at = new Date();
    request.processed_by = leaderId;

    if (isApproved) {
      request.status = ClanRequestStatus.APPROVED;
      request.user.clan_id = clan.id;

      await Promise.all([
        this.userRepo.save(request.user),
        this.clanRequestRepo
          .createQueryBuilder()
          .update()
          .set({
            status: ClanRequestStatus.REJECTED,
            processed_at: new Date(),
          })
          .where('user_id = :userId', { userId: request.user.id })
          .andWhere('id != :approvedRequestId', {
            approvedRequestId: request.id,
          })
          .andWhere('status = :status', { status: ClanRequestStatus.PENDING })
          .execute(),
      ]);
      const stat = this.userClantStatRepo.create({
        user_id: request.user.id,
        clan_id: clan.id,
        total_score: 0,
        weekly_score: 0,
        harvest_count: FARM_CONFIG.HARVEST.MAX_HARVEST,
        harvest_interrupt_count: FARM_CONFIG.HARVEST.MAX_INTERRUPT,
        harvest_count_use: 0,
        harvest_interrupt_count_use: 0,
      });
      await this.userClantStatRepo.save(stat);
      await this.clanRequestRepo.save(request);
      this.eventEmitter.emit(ClanBroadcastEventType.JOIN_APPROVED, {
        request,
      });
    } else {
      request.status = ClanRequestStatus.REJECTED;
      await this.clanRequestRepo.save(request);
      this.eventEmitter.emit(ClanBroadcastEventType.JOIN_REJECTED, {
        request,
      });
    }
  }

  async cancelJoinRequest(userId: string, clanId: string) {
    const request = await this.clanRequestRepo.findOne({
      where: {
        user_id: userId,
        clan_id: clanId,
        status: ClanRequestStatus.PENDING,
      },
    });

    if (!request) {
      throw new NotFoundException('No pending join request found');
    }

    const now = new Date();

    if (
      now.getTime() - request.created_at.getTime() <
      ClanRequestService.CANCEL_COOLDOWN_MS
    ) {
      const remainingHours =
        ClanRequestService.CANCEL_COOLDOWN_MS / (60 * 60 * 1000);
      return remainingHours;
    }

    request.status = ClanRequestStatus.CANCELLED;
    request.processed_at = new Date();
    request.processed_by = userId;

    await this.clanRequestRepo.save(request);
  }

  async getPendingRequests(clanId: string, query: PendingRequestQueryDto) {
    const {
      page = 1,
      limit = 30,
      sort_by = 'created_at',
      order = 'DESC',
      search,
    } = query;

    const [requests, total] = await this.clanRequestRepo.findAndCount({
      where: {
        clan_id: clanId,
        status: ClanRequestStatus.PENDING,
        ...(search && { username: ILike(`%${search}%`) }),
      },
      select: {
        clan: { name: true },
      },
      relations: ['user', 'clan'],
      take: limit,
      skip: (page - 1) * limit,
      order: {
        [sort_by]: order,
      },
    });

    return new Pageable(plainToInstance(ClanRequestListDto, requests), {
      size: limit,
      page,
      total,
    });
  }

  async findAllRequestsByUser(userId: string) {
    return await this.clanRequestRepo.find({
      where: {
        user_id: userId,
      },
      select: ['id', 'clan_id', 'status', 'created_at'],
      order: {
        created_at: 'DESC',
      },
    });
  }
}
