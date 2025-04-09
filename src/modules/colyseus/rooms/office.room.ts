import { UserEntity } from '@modules/user/entity/user.entity';
import { Injectable } from '@nestjs/common';
import { Client } from 'colyseus';
import { BaseGameRoom } from './base-game.room';
import { Player } from '@types';

@Injectable()
export class OfficeRoom extends BaseGameRoom {
  onJoin(client: Client<UserEntity>, options: any, auth: any) {
    const { userData } = client;

    this.logger.log(
      `Player ${userData?.username} joined OfficeRoom ${this.roomName}, id: ${this.roomId}`,
    );

    const player = new Player();
    player.id = client.sessionId;

    player.x = 912;
    player.y = -261;
    player.display_name = userData?.display_name || userData?.username || '';
    player.skin_set = userData?.skin_set?.join('/') || '';

    this.state.players.set(client.sessionId, player);
    this.logger.log(
      `Player ${userData?.username} has position ${player.x} ${player.y}`,
    );
  }
}
