import { BattleRoom } from '@modules/colyseus/rooms/battle.room';
import { GameRoom } from '@modules/colyseus/rooms/game.room';
import { Meeting1Room } from '@modules/colyseus/rooms/meeting1.room';
import { OfficeRoom } from '@modules/colyseus/rooms/office.room';
import { Shop1Room } from '@modules/colyseus/rooms/shop1.room';
import { Type } from '@nestjs/common';
import { Room } from 'colyseus';

export const SUB_GAME_ROOM: Record<
  string,
  {
    children?: typeof SUB_GAME_ROOM;
    room: Type<Room>;
  }
> = {
  '': {
    room: GameRoom,
  },
  'office': {
    room: OfficeRoom,
    children: {
      'meeting-room1': {
        room: Meeting1Room,
      },
    },
  },
  'shop1': {
    room: Shop1Room,
  },
  'battle-room': {
    room: BattleRoom,
  },
};
