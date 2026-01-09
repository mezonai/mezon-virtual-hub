import { UserEntity } from '@modules/user/entity/user.entity';
import { Injectable } from '@nestjs/common';
import { Client } from 'colyseus';
import { BaseGameRoom } from './base-game.room';
import { AuthenticatedClient, Player } from '@types';
import { DoorManager } from '../door/DoorManager';
import { MapKey, SubMap } from '@enum';
import { MessageTypes } from '../MessageTypes';

@Injectable()
export class OfficeRoom extends BaseGameRoom {
  async onJoin(client: AuthenticatedClient, options: any, auth: any) {
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
    player.pet_players = JSON.stringify(
      (userData?.pet_players.filter(a => a.is_brought)
        .map(a => ({
          id: a.id,
          name: a.name,
          species: a.pet?.species,
          rarity: a?.current_rarity,
        }))) ?? []
    );
    player.totalPetBattle = userData?.pet_players?.filter(pet => pet?.battle_slot > 0)?.length ?? 0;
    player.isInBattle = false;
    player.clan_id = userData?.clan?.id ?? '';
    this.state.players.set(client.sessionId, player);
    this.logger.log(
      `Player ${userData?.username} has position ${player.x} ${player.y}`,
    );
  }

  async onCreate(options: any) {
    super.onCreate(options);
    this.doorManager = new DoorManager(this.state);
    switch (this.roomName) {
      case this.buildRoomName(MapKey.SG, SubMap.OFFICE):
        this.doorManager.spawnDoors(1);
        break;
      case this.buildRoomName(MapKey.HN1, SubMap.OFFICE):
        this.doorManager.spawnDoors(1);
        break;
      case this.buildRoomName(MapKey.HN2, SubMap.OFFICE):
        this.doorManager.spawnDoors(1);
        break;
      default:
        break;
    }
    this.onMessage(MessageTypes.OPEN_DOOR, (client, data) => {
      const { doorId } = data;
      const door = this.doorManager.openDoor(doorId);
      if (door) {
        const responseData = {
          sessionId: client.sessionId,
          doorUpadte: door,
        };
        this.broadcast(MessageTypes.ON_OPEN_DOOR, responseData);
      }
    });

    this.onMessage(MessageTypes.CLOSE_DOOR, (client, data) => {
      const { doorId } = data;
      const door = this.doorManager.closeDoor(doorId);
      if (door) {
        const responseData = {
          sessionId: client.sessionId,
          doorUpadte: door,
        };
        this.broadcast(MessageTypes.ON_CLOSE_DOOR, responseData);
      }
    });
  }

  buildRoomName(mapKey: MapKey, subMap: SubMap): string {
    return `${mapKey}-${subMap}`;
  }
}
