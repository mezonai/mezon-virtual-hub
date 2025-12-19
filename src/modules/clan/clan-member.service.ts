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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClanBroadcastEventType } from '@modules/shared/events/event-types.enum';
import { UserClanStatEntity } from '@modules/user-clan-stat/entity/user-clan-stat.entity';

@Injectable()
export class ClanMemberService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ClanEntity)
    private readonly clanRepository: Repository<ClanEntity>,
    @InjectRepository(UserClanStatEntity)
    private readonly userClantStatRepo: Repository<UserClanStatEntity>,
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
  
  async assignViceLeaders(clanId: string, targetUserIds: string[]) {
    const MAX_VICE_LEADER = 5;
    return this.userRepository.manager.transaction(async (manager) => {
      const users = await manager.find(UserEntity, {
        where: {
          id: In(targetUserIds),
          clan_id: clanId,
        },
        relations: ['clan'],
      });

      if (users.length !== targetUserIds.length) {
        throw new NotFoundException('Some users not found in clan');
      }

      for (const user of users) {
        if (user.clan_role === ClanRole.LEADER) {
          throw new BadRequestException(
            `User ${user.id} is leader and cannot be vice leader`,
          );
        }
      }

      const currentViceCount = await manager.count(UserEntity, {
        where: {
          clan_id: clanId,
          clan_role: ClanRole.VICE_LEADER,
        },
      });

      const usersToPromote = users.filter(
        (u) => u.clan_role !== ClanRole.VICE_LEADER,
      );

      const finalViceCount = currentViceCount + usersToPromote.length;
      if (finalViceCount > MAX_VICE_LEADER) {
        throw new BadRequestException(
          `Vice leader limit exceeded (current: ${currentViceCount}, adding: ${usersToPromote.length}, max: ${MAX_VICE_LEADER})`,
        );
      }

      for (const user of usersToPromote) {
        user.clan_role = ClanRole.VICE_LEADER;
      }

      await manager.save(usersToPromote);

      for (const user of usersToPromote) {
        this.eventEmitter.emit(ClanBroadcastEventType.ROLE_PROMOTED, {
          user,
          clan: user.clan,
          role: ClanRole.VICE_LEADER,
        });
      }

      return {
        success: true,
        promotedUserIds: usersToPromote.map((u) => u.id),
      };
    });
  }

  async removeViceLeaders(clanId: string, targetUserIds: string[]) {
    return this.userRepository.manager.transaction(async (manager) => {
      const targets = await manager.find(UserEntity, {
        where: {
          id: In(targetUserIds),
          clan_id: clanId,
        },
        relations: ['clan'],
      });

      if (targets.length !== targetUserIds.length) {
        throw new NotFoundException('Some users not found in clan');
      }

      targets.forEach((u) => {
        if (u.clan_role !== ClanRole.VICE_LEADER) {
          throw new BadRequestException(`User ${u.id} is not a vice leader`);
        }
      });

      targets.forEach((u) => {
        u.clan_role = ClanRole.MEMBER;
      });

      await manager.save(targets);

      targets.forEach((user) => {
        this.eventEmitter.emit(ClanBroadcastEventType.ROLE_DEMOTED, {
          user,
          clan: user.clan,
          role: ClanRole.MEMBER,
        });
      });

      return {
        success: true,
        demotedUserIds: targets.map((u) => u.id),
      };
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

    const leaderTargets = targets.filter(
      (t) => t.clan_role === ClanRole.LEADER,
    );
    if (leaderTargets.length > 0) {
      throw new BadRequestException('Cannot remove the clan leader');
    }

    const emitPayloads = targets.map((target) => {
      const oldClan = target.clan;
      target.clan_id = null;
      target.clan_role = ClanRole.MEMBER;
      target.clan = null;
      return { target, oldClan };
    });

    await this.userRepository.save(targets);
    await this.userClantStatRepo.update(
      { user_id: In(targetUserIds), clan_id: clanId },
      { deleted_at: new Date() }, // soft-delete stat cũ
    );

    emitPayloads.forEach(({ target, oldClan }) => {
      this.eventEmitter.emit(ClanBroadcastEventType.MEMBER_KICKED, {
        user: target,
        clan: oldClan,
      });
    });
  }
}
