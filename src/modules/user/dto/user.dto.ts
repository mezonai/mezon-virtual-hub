import { Gender } from '@enum';
import { InventoryDto } from '@modules/inventory/dto/inventory.dto';
import { MapDtoResponse } from '@modules/map/dto/map.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';

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

  @Type(() => MapDtoResponse)
  @Expose()
  map: MapDtoResponse | null;
}

export class UpdateInfoDto {
  @ApiProperty({
    description: 'The map_id of the user',
    type: UUID,
    required: false,
  })
  @IsUUID()
  @IsOptional()
  map_id?: string;

  @ApiProperty({
    description: 'position_x of the user',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  position_x?: number;

  @ApiProperty({
    description: 'position_y of the user',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  position_y?: number;

  @ApiProperty({
    description: 'The display name of the user',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  display_name?: string;

  @ApiProperty({
    description: 'The gender of the user',
    enum: Gender,
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}