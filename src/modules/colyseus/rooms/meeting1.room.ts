import { UserEntity } from '@modules/user/entity/user.entity';
import { Injectable } from '@nestjs/common';
import { Player } from '@types';
import { Client } from 'colyseus';
import { BaseGameRoom } from './base-game.room';
import { any } from 'joi';

@Injectable()
export class Meeting1Room extends BaseGameRoom {
  async onJoin(client: Client<UserEntity>, options: any, auth: any) {
    super.onJoin(client, options, auth);
    const { userData } = client;
    this.logger.log(
      `Player ${userData?.username} joined Meeting1Room ${this.roomName}, id: ${this.roomId}`,
    );

    const player = new Player();
    player.id = client.sessionId;
    player.user_id = userData?.id ?? "";
    player.x = userData?.position_x ?? 0;
    player.y = userData?.position_y ?? 0;

    player.display_name = userData?.display_name || userData?.username || '';
    player.skin_set = userData?.skin_set?.join('/') || '';

    this.state.players.set(client.sessionId, player);
    this.logger.log(
      `Player ${userData?.username} has position ${player.x} ${player.y}`,
    );
  }
}
