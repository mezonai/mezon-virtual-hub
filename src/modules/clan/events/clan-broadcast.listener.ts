import { Logger } from '@libs/logger';
import { ClanRequestService } from '@modules/clan-request/clan-request.service';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ClanBroadcastService } from './clan-broadcast.service';
import { ClanEntity } from '../entity/clan.entity';
import { ClanBroadcastEventType } from '@modules/shared/events/event-types.enum';
import { ClanRequestEntity } from '@modules/clan-request/entity/clan-request.entity';

@Injectable()
export class ClanBroadcastEventsListener {
  private readonly logger = new Logger(ClanBroadcastEventsListener.name);

  constructor(private readonly clanBroadcastService: ClanBroadcastService) {}

  @OnEvent(ClanBroadcastEventType.JOIN_REQUEST, { async: true })
  async handleJoinRequest(payload: { clan: ClanEntity; user: UserEntity }) {
    this.clanBroadcastService
      .notifyJoinRequestReceived(payload.clan, payload.user)
      .catch((err) =>
        this.logger.error(`Failed to broadcast join request: ${err.message}`),
      );
  }

  @OnEvent(ClanBroadcastEventType.JOIN_APPROVED, { async: true })
  async handleJoinApproved(payload: { request: ClanRequestEntity }) {
    this.clanBroadcastService.notifyJoinApproved(payload.request);
  }

  @OnEvent(ClanBroadcastEventType.JOIN_REJECTED, { async: true })
  async handleJoinRejected(payload: { request: ClanRequestEntity }) {
    this.clanBroadcastService.notifyJoinRejected(payload.request);
  }

  @OnEvent(ClanBroadcastEventType.NEW_LEADER_ASSIGNED, { async: true })
  async handleNewLeaderAssigned(payload: {
    user: UserEntity;
    clan: ClanEntity;
  }) {
    this.clanBroadcastService.notifyClanLeaderTransferred(
      payload.user,
      payload.clan,
    );
  }

  @OnEvent(ClanBroadcastEventType.ROLE_PROMOTED, { async: true })
  async handleViceLeaderAssigned(payload: {
    user: UserEntity;
    clan: ClanEntity;
  }) {
    this.clanBroadcastService.notifyViceClanLeaderAssigned(
      payload.user,
      payload.clan,
    );
  }

  @OnEvent(ClanBroadcastEventType.ROLE_DEMOTED, { async: true })
  async handleClanRoleDemoted(payload: { user: UserEntity; clan: ClanEntity }) {
    this.clanBroadcastService.notifyClanRoleDemoted(payload.user, payload.clan);
  }

  @OnEvent(ClanBroadcastEventType.MEMBER_KICKED, { async: true })
  async handleMemberKicked(payload: { user: UserEntity; clan: ClanEntity }) {
    this.clanBroadcastService.notifyClanMemberKicked(
      payload.user,
      payload.clan,
    );
  }
}
