import { Exclude, Expose } from 'class-transformer';
import { ItemEntity } from '../entity/item.entity';
import { Gender, ItemCode, ItemType } from '@enum';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

@Exclude()
export class ItemDto implements Partial<ItemEntity> {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  type: ItemType;

  @Expose()
  item_code: ItemCode | null;
}

export class ItemDtoRequest {
  @ApiProperty({
    description: 'Name of the item',
    example: 'Sword',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Gender can use this item',
    example: Gender.NOT_SPECIFIED,
    default: Gender.NOT_SPECIFIED,
    enum: Gender,
  })
  @IsOptional()
  gender: Gender = Gender.NOT_SPECIFIED;

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
    example: ItemType.EYES,
  })
  @IsNumber()
  type: ItemType;
}
