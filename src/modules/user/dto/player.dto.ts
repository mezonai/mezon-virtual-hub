export class PlayerDto {
  id: string;
  username: string;
  avatarUrl: string;
  position: {
    x: number;
    y: number;
  };
  map?: {
    id: string;
    name: string;
    width: number;
    height: number;
  };
  inventory: {
    itemId: string;
    name: string;
    isEquipped: boolean;
  }[];

  constructor(user: any) {
    this.id = user.id;
    this.username = user.username;
    this.avatarUrl = user.avatar_url;
    this.position = {
      x: user.position_x,
      y: user.position_y,
    };
    this.map = user.defaultMap
      ? {
          id: user.defaultMap.id,
          name: user.defaultMap.name,
          width: user.defaultMap.width,
          height: user.defaultMap.height,
        }
      : undefined;
    this.inventory = user.inventory.map((inv: any) => ({
      itemId: inv.item.id,
      name: inv.item.name,
      isEquipped: inv.equipped,
    }));
  }
}
