import { Exclude, Expose } from 'class-transformer';
import { ItemEntity } from '../entity/item.entity';
import { ItemType } from '@enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class ItemDto {
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
  is_static: boolean;

  @Expose()
  gold?: number;

  @Expose()
  type: number;

  @Exclude()
  deleted_at: Date | null;

  @Exclude()
  updated_at: Date | null;

  @Exclude()
  created_at: Date | null;
}

export class ItemDtoRequest {
  @ApiProperty({
    description: 'Name of the item',
    example: 'Sword',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the item',
    example: 'A sharp sword for combat',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Width of the item',
    example: 0,
    required: false,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  width?: number;

  @ApiProperty({
    description: 'Height of the item',
    example: 0,
    required: false,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiProperty({
    description: 'Gold value of the item',
    example: 100,
    required: false,
    default: 0,
  })
  @IsNumber()
  gold?: number;

  @ApiProperty({
    description:
      'Type of the item (e.g., 1 for ACCESSORY, 2 for Shirt, 3 for Hair,...)',
    enum: ItemType,
    example: ItemType.Face,
  })
  @IsNumber()
  type: number;

  @ApiProperty({
    description: 'Indicates if the item is equippable',
    example: true,
  })
  @IsOptional()
  is_equippable?: boolean;

  @ApiProperty({
    description: 'Indicates if the item is static (non-movable)',
    example: false,
  })
  @IsOptional()
  is_static?: boolean;
}
