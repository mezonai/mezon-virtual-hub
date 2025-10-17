import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { ClanRole } from '@enum';
import { ClanBroadcastService } from '@modules/clan/events/clan-broadcast.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClanBroadcastEventType } from '@modules/shared/events/event-types.enum';

@Injectable()
export class ClanMemberService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ClanEntity)
    private readonly clanRepository: Repository<ClanEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async transferLeadership(
    clanId: string,
    targetUserId: string,
    leader: UserEntity,
  ) {
    const targetUser = await this.userRepository.findOne({
      where: { id: targetUserId, clan_id: clanId },
      relations: ['clan'],
    });

    if (!targetUser || !targetUser.clan) {
      throw new NotFoundException('Target user not found in clan');
    }

    if (targetUser.clan_role === ClanRole.LEADER) {
      throw new BadRequestException('Target user is already the leader');
    }

    if (targetUser.clan_role === ClanRole.VICE_LEADER) {
      throw new BadRequestException('Target user is already the vice leader');
    }

    leader.clan_role = ClanRole.MEMBER;
    targetUser.clan_role = ClanRole.LEADER;

    await this.userRepository.save([leader, targetUser]);
    this.eventEmitter.emit(ClanBroadcastEventType.NEW_LEADER_ASSIGNED, {
      user: targetUser,
      clan: targetUser.clan,
    });
  }

  async assignViceLeader(clanId: string, targetUserId: string) {
    const target = await this.userRepository.findOne({
      where: { id: targetUserId, clan_id: clanId },
      relations: ['clan'],
    });

    if (!target || !target.clan) {
      throw new NotFoundException('User not found in clan');
    }

    if (target.clan_role === ClanRole.VICE_LEADER) {
      throw new BadRequestException('User is already the vice leader');
    }

    const existingVice = await this.userRepository.findOne({
      where: { clan_id: clanId, clan_role: ClanRole.VICE_LEADER },
    });
    if (existingVice) {
      throw new BadRequestException('Clan already has a vice leader');
    }

    target.clan_role = ClanRole.VICE_LEADER;
    await this.userRepository.save(target);

    this.eventEmitter.emit(ClanBroadcastEventType.ROLE_PROMOTED, {
      user: target,
      clan: target.clan,
    });
  }

  async removeViceLeader(clanId: string, targetUserId: string) {
    const target = await this.userRepository.findOne({
      where: { id: targetUserId, clan_id: clanId },
      relations: ['clan'],
    });

    if (!target || !target.clan) {
      throw new NotFoundException('User not found in clan');
    }

    if (target.clan_role !== ClanRole.VICE_LEADER) {
      throw new BadRequestException('User is not a vice leader');
    }

    target.clan_role = ClanRole.MEMBER;
    await this.userRepository.save(target);

    this.eventEmitter.emit(ClanBroadcastEventType.ROLE_DEMOTED, {
      user: target,
      clan: target.clan,
    });
  }

  async removeMembers(clanId: string, targetUserIds: string[]) {
  const targets = await this.userRepository.find({
    where: { id: In(targetUserIds), clan_id: clanId },
    relations: ['clan'],
  });

  if (!targets.length) {
    throw new NotFoundException('No users found in clan');
  }

  const leaderTargets = targets.filter(t => t.clan_role === ClanRole.LEADER);
  if (leaderTargets.length > 0) {
    throw new BadRequestException('Cannot remove the clan leader');
  }

  for (const target of targets) {
    const oldClan = target.clan;
    target.clan_id = null;
    target.clan_role = ClanRole.MEMBER;
    target.clan = null;
    await this.userRepository.save(target);

    this.eventEmitter.emit(ClanBroadcastEventType.MEMBER_KICKED, {
      user: target,
      clan: oldClan,
    });
  }
}
}
