import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { MessageTypes } from '@modules/colyseus/MessageTypes';
import { PlayerSessionManager } from '@modules/colyseus/player/PlayerSessionManager';
import { Injectable, Logger } from '@nestjs/common';
import moment from 'moment';
import { ClanRequestEntity } from './entity/clan-request.entity';
import { UserEntity } from '@modules/user/entity/user.entity';

@Injectable()
export class ClanBroadcastService {
  private readonly logger = new Logger(ClanBroadcastService.name);

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

  public broadcastJoinRequestReceived(clan: ClanEntity, user: UserEntity) {
    // const leaderIds = [clan.leader_id, clan.vice_leader_id].filter(Boolean);

    // for (const userId of leaderIds) {
    //   if (!userId) return;
    //   const message = `${user.username} đã gửi yêu cầu tham gia văn phòng "${clan.name}".`;
    //   this.sendToUser(userId, MessageTypes.JOIN_CLAN_REQUEST, message);
    // }
  }

  public broadcastJoinApproved(clanRequest: ClanRequestEntity) {
    const message = `Yêu cầu tham gia "${clanRequest.clan?.name}" của bạn đã được chấp nhận!`;
    this.sendToUser(
      clanRequest.user_id,
      MessageTypes.JOIN_CLAN_APPROVED,
      message,
    );
  }

  public broadcastJoinRejected(clanRequest: ClanRequestEntity) {
    const message = `Yêu cầu tham gia "${clanRequest.clan?.name}"của bạn đã bị từ chối.`;
    this.sendToUser(
      clanRequest.user_id,
      MessageTypes.JOIN_CLAN_REJECTED,
      message,
    );
  }
}
