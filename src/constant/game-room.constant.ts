export const SUB_GAME_ROOM: Record<
  string,
  { 
    default_position_x: number; 
    default_position_y: number; 
    children?: typeof SUB_GAME_ROOM
  }
> = {
  'office': {
    default_position_x: 0,
    default_position_y: 0,
    children: {
      'meeting-room1': { default_position_x: 0, default_position_y: 0 },
    },
  },
  'shop1': { 
    default_position_x: 0,
    default_position_y: -302,
  },
};
