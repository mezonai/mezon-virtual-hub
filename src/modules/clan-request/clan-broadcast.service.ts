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
      `📢 Send ${type} to client: ${client.sessionId} (${userId}) at ${timestamp}`,
    );

    client.send(type, {
      sessionId: client.sessionId,
      message,
    });
  }

  public broadcastJoinRequestReceived(clan: ClanEntity, user: UserEntity) {
    const leaderIds = [clan.leader_id, clan.vice_leader_id].filter(Boolean);

    for (const userId of leaderIds) {
      if (!userId) return;
      const message = `📩 ${user.username} has requested to join your clan "${clan.name}".`;
      this.sendToUser(userId, MessageTypes.JOIN_CLAN_REQUEST, message);
    }
  }

  public broadcastJoinApproved(clanRequest: ClanRequestEntity) {
    const message = `🎉 Your request to join "${clanRequest.clan?.name}" has been approved!`;
    this.sendToUser(
      clanRequest.user_id,
      MessageTypes.JOIN_CLAN_APPROVED,
      message,
    );
  }

  public broadcastJoinRejected(clanRequest: ClanRequestEntity) {
    const message = `❌ Your request to join "${clanRequest.clan?.name}" was rejected.`;
    this.sendToUser(
      clanRequest.user_id,
      MessageTypes.JOIN_CLAN_REJECTED,
      message,
    );
  }
}
