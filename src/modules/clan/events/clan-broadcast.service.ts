import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { MessageTypes } from '@modules/colyseus/MessageTypes';
import { PlayerSessionManager } from '@modules/colyseus/player/PlayerSessionManager';
import { Injectable, Logger } from '@nestjs/common';
import moment from 'moment';
import { ClanRequestEntity } from '../../clan-request/entity/clan-request.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ClanRole } from '@enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

@Injectable()
export class ClanBroadcastService {
  private readonly logger = new Logger(ClanBroadcastService.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  private sendToUser(userId: string, type: MessageTypes, message: string) {
    const client = PlayerSessionManager.getClient(userId);
    if (!client) return;

    const timestamp = moment()
      .tz('Asia/Ho_Chi_Minh')
      .format('YYYY-MM-DD HH:mm:ss');

    this.logger.log(
      `Send ${type} to client: ${client.sessionId} (${userId}) at ${timestamp}`,
    );

    client.send(type, {
      sessionId: client.sessionId,
      message,
    });
  }

  public async notifyJoinRequestReceived(clan: ClanEntity, user: UserEntity) {
    const leaders = await this.userRepo.find({
      where: {
        clan_id: clan.id,
        clan_role: In([ClanRole.LEADER, ClanRole.VICE_LEADER]),
      },
    });
    const leaderIds = leaders.map(({ id }) => id);
    for (const userId of leaderIds) {
      const message = `${user.username} đã gửi yêu cầu tham gia văn phòng "${clan.name}".`;
      this.sendToUser(userId, MessageTypes.JOIN_CLAN_REQUEST, message);
    }
  }

  public notifyJoinApproved(clanRequest: ClanRequestEntity) {
    const message = `Yêu cầu tham gia "${clanRequest.clan?.name}" của bạn đã được chấp nhận!`;
    this.sendToUser(
      clanRequest.user_id,
      MessageTypes.JOIN_CLAN_APPROVED,
      message,
    );
  }

  public notifyJoinRejected(clanRequest: ClanRequestEntity) {
    const message = `Yêu cầu tham gia "${clanRequest.clan?.name}"của bạn đã bị từ chối.`;
    this.sendToUser(
      clanRequest.user_id,
      MessageTypes.JOIN_CLAN_REJECTED,
      message,
    );
  }

  public notifyClanLeaderTransferred(user: UserEntity, clan: ClanEntity) {
    const message = `Bạn trở đã thành Lãnh đạo mới của ${clan.name}!`;
    this.sendToUser(user.id, MessageTypes.CLAN_LEADER_TRANSFERRED, message);
  }

  public notifyViceClanLeaderAssigned(user: UserEntity, clan: ClanEntity) {
    const message = `Bạn trở đã thành phó Lãnh đạo của ${clan.name}!`;
    this.sendToUser(user.id, MessageTypes.CLAN_VICE_LEADER_ASSIGNED, message);
  }

  public notifyClanRoleDemoted(user: UserEntity, clan: ClanEntity) {
    const message = `Bạn không còn giữ vai trò phó lãnh đạo của ${clan.name}.`;
    this.sendToUser(user.id, MessageTypes.CLAN_VICE_LEADER_DEMOTED, message);
  }

  public notifyClanMemberKicked(user: UserEntity, clan: ClanEntity) {
    const message = `Bạn đã bị trục xuất khỏi ${clan.name}.`;
    this.sendToUser(user.id, MessageTypes.CLAN_MEMBER_KICKED, message);
  }
}
