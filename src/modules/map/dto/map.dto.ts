import { ApiProperty, PickType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { MapEntity } from '../entity/map.entity';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { MapKey } from '@enum';

export class CreateMapDto {
  readonly name: string;
  readonly map_key?: string;
  readonly width: number;
  readonly height: number;
}

export class UpdateMapDto {
  @ApiProperty({
    description: 'The name of the map',
    type: String,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  name?: string | null;

  @ApiProperty({
    description: 'The width of the map',
    type: Number,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  width?: number | null;

  @ApiProperty({
    description: 'The height of the map',
    type: Number,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  height?: number | null;

  @ApiProperty({
    description: 'Lock the map',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  is_locked?: boolean;
}

export class MapDtoResponse {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  map_key: MapKey;

  @Expose()
  is_locked: boolean;

  @Expose()
  created_at: Date;

  @Expose()
  default_position_x: number;

  @Expose()
  default_position_y: number;

  @Expose()
  updated_at: Date;

  @Exclude()
  deleted_at: Date | null;

  @Exclude()
  height: number;

  @Exclude()
  width: number;
}
