import { Expose, Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID } from 'class-validator';

class ItemDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  width: number;

  @Expose()
  height: number;

  @Expose()
  is_equippable: boolean;

  @Expose()
  isStatic: boolean;
}

class InventoryDto {
  @Expose()
  id: string;

  @Expose()
  equipped: boolean;

  @Type(() => ItemDto)
  @Expose()
  item: ItemDto;
}

class MapDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  map_key: string;

  @Expose()
  width: number;

  @Expose()
  height: number;
}

export class UserInformationDto {
  @Expose()
  user: {
    id: string;
    username: string;
    email: string;
    position_x: number | null;
    position_y: number | null;
    avatar_url: string | null;
  };

  @Type(() => InventoryDto)
  @Expose()
  inventories: InventoryDto[];

  @Type(() => MapDto)
  @Expose()
  map: MapDto | null;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  position_x?: number;

  @IsOptional()
  position_y?: number;

  @IsOptional()
  @IsUUID()
  mapId?: string;

  @IsOptional()
  @IsUUID('all', { each: true })
  inventoryIds?: string[];
}