import { UserEntity } from '@modules/user/entity/user.entity';
import { Injectable } from '@nestjs/common';
import { AuthenticatedClient, Player } from '@types';
import { Client } from 'colyseus';
import { BaseGameRoom } from './base-game.room';

@Injectable()
export class Shop1Room extends BaseGameRoom {
  async onJoin(client: AuthenticatedClient, options: any, auth: any) {
    super.onJoin(client, options, auth);
    const { userData } = client;

    this.logger.log(
      `Player ${userData?.username} joined Shop1Room ${this.roomName}, id: ${this.roomId}`,
    );

    const player = new Player();
    player.id = client.sessionId;
    player.user_id = userData?.id ?? '';
    player.x = 0;
    player.y = -302;
    player.is_show_name = BaseGameRoom.eventData == null;
    player.display_name = userData?.display_name || userData?.username || '';
    player.skin_set = userData?.skin_set?.join('/') || '';
    player.pet_players = JSON.stringify(
      userData?.pet_players
        ?.filter((a) => a.is_brought)
        .map((a) => ({
          id: a.id,
          name: a.name,
          species: a.pet?.species,
          rarity: a.pet?.rarity,
        })) ?? [],
    );
    player.isInBattle = false;
    player.clan_id = userData?.clan?.id ?? '';
    this.state.players.set(client.sessionId, player);
    this.logger.log(
      `Player ${userData?.username} has position ${player.x} ${player.y}`,
    );
  }
}
