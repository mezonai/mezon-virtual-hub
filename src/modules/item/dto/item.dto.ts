import { Exclude, Expose } from 'class-transformer';
import { ItemEntity } from '../entity/item.entity';
import { Gender, ItemCode, ItemType } from '@enum';
import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

@Exclude()
export class ItemDto implements Partial<ItemEntity> {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  type: ItemType;

  @Expose()
  gold?: number;

  @Expose()
  gender: Gender;

  @Expose()
  item_code: ItemCode | null;

  @Expose()
  is_purchasable: boolean;

  @Expose()
  is_stackable: boolean;

  @Expose()
  rate?: number;
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
  @IsString()
  type: ItemType;

  @ApiProperty({ description: 'Item code', example: ItemCode.RARITY_CARD_EPIC, enum: ItemCode, required: false })
  @IsOptional()
  @IsString()
  item_code?: ItemCode;

  @ApiProperty({ description: 'Indicates whether this item can be purchased', example: true, required: false })
  @IsOptional()
  is_purchasable?: boolean;

  @ApiProperty({ description: 'Indicates whether this item is stackable', example: false, required: false })
  @IsOptional()
  is_stackable?: boolean;
}

export class GetItemsQueryDto {
  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ enum: ItemType })
  @IsOptional()
  @IsEnum(ItemType)
  type?: ItemType;

  @ApiPropertyOptional({ enum: ItemCode })
  @IsOptional()
  @IsEnum(ItemCode)
  item_code?: ItemCode;
}
