import { UserEntity } from '@modules/user/entity/user.entity';
import { Injectable } from '@nestjs/common';
import { Client } from 'colyseus';
import { BaseGameRoom } from './base-game.room';
import { Player } from '@types';

@Injectable()
export class OfficeRoom extends BaseGameRoom {
  async onJoin(client: Client<UserEntity>, options: any, auth: any) {
    super.onJoin(client, options, auth);
    const { userData } = client;

    this.logger.log(
      `Player ${userData?.username} joined OfficeRoom ${this.roomName}, id: ${this.roomId}`,
    );

    const player = new Player();
    player.id = client.sessionId;
    player.user_id = userData?.id ?? "";
    player.x = 912;
    player.y = -261;
    player.is_show_name = BaseGameRoom.eventData == null;
    player.display_name = userData?.display_name || userData?.username || '';
    player.skin_set = userData?.skin_set?.join('/') || '';
    player.animals = JSON.stringify(
      (userData?.animals?.filter(a => a.is_brought)
        .map(a => ({
          id: a.id,
          name: a.name,
          species: a.species,
        }))) ?? []
    );
    this.state.players.set(client.sessionId, player);
    this.logger.log(
      `Player ${userData?.username} has position ${player.x} ${player.y}`,
    );
  }
}
