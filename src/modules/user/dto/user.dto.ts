import { InventoryDto } from '@modules/inventory/dto/inventory.dto';
import { MapDtoRequest } from '@modules/map/dto/map.dto';
import { Expose, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class UserInformationDto {
  @Expose()
  user: {
    id: string;
    username: string;
    email: string;
    gold: number;
    position_x: number | null;
    position_y: number | null;
    avatar_url: string | null;
  };

  @Type(() => InventoryDto)
  @Expose()
  inventories: InventoryDto[];

  @Type(() => MapDtoRequest)
  @Expose()
  map: MapDtoRequest | null;
}

export class UpdateUserDto {
  @IsOptional()
  @IsUUID()
  map_id?: string;

  @IsOptional()
  @IsNumber()
  position_x?: number;

  @IsOptional()
  @IsNumber()
  position_y?: number;
}