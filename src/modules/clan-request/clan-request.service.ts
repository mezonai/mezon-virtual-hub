import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClanRequestEntity } from './entity/clan-request.entity';
import { ClanRequestStatus } from '@enum';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { BaseService } from '@libs/base/base.service';

@Injectable()
export class ClanRequestService extends BaseService<ClanRequestEntity> {
  private static readonly CANCEL_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 1 day
  constructor(
    @InjectRepository(ClanRequestEntity)
    private readonly clanRequestRepo: Repository<ClanRequestEntity>,
    @InjectRepository(ClanEntity)
    private readonly clanRepo: Repository<ClanEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
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
      user_id: clan.id,
      status: ClanRequestStatus.PENDING,
    });

    return await this.clanRequestRepo.save(request);
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

    if (clan.leader_id !== leaderId && clan.vice_leader_id !== leaderId) {
      throw new ForbiddenException('Only leader or vice leader can approve');
    }

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
    } else {
      request.status = ClanRequestStatus.REJECTED;
    }

    return await this.clanRequestRepo.save(request);
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
      throw new BadRequestException(
        `Join request can only be canceled after ${
          ClanRequestService.CANCEL_COOLDOWN_MS / (60 * 60 * 1000)
        } hours of creation`,
      );
    }

    request.status = ClanRequestStatus.CANCELLED;
    request.processed_at = new Date();
    request.processed_by = userId;

    await this.clanRequestRepo.save(request);
  }

  async getPendingRequests(clanId: string) {
    return this.clanRequestRepo.find({
      where: { clan_id: clanId, status: ClanRequestStatus.PENDING },
      relations: ['user'],
    });
  }
}
