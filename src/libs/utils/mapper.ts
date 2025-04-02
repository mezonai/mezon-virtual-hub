import { SUB_GAME_ROOM } from "@constant";
import { plainToInstance } from "class-transformer";

export function Mapper<T>(cls: new () => T, plain: object): T {
  return plainToInstance(cls, plain, { excludeExtraneousValues: true });
}


export const flattenRooms = (rooms: typeof SUB_GAME_ROOM): Record<string, { default_position_x: number; default_position_y: number }> => {
  let flatRooms: Record<string, { default_position_x: number; default_position_y: number }> = {};

  for (const roomKey in rooms) {
    const room = rooms[roomKey];
    flatRooms[roomKey] = {
      default_position_x: room.default_position_x ?? 0,
      default_position_y: room.default_position_y ?? 0,
    };

    if (room.children) {
      for (const subRoomKey in room.children) {
        flatRooms[subRoomKey] = {
          default_position_x: room.children[subRoomKey].default_position_x ?? 0,
          default_position_y: room.children[subRoomKey].default_position_y ?? 0,
        };
      }
    }
  }

  return flatRooms;
};