import { InventoryType } from '@enum';
import { FoodDto } from '@modules/food/dto/food.dto';
import { ItemDto } from '@modules/item/dto/item.dto';
import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class InventoryDto {
  @Expose()
  id: string;

  @Exclude()
  item_id: boolean;

  @Exclude()
  deleted_at: Date | null;

  @Exclude()
  updated_at: Date | null;

  @Exclude()
  created_at: Date | null;

  @Type(() => ItemDto)
  @Expose()
  item: ItemDto;

  @Type(() => FoodDto)
  @Expose()
  food: FoodDto;
}

export class FoodInventoryResDto extends OmitType(InventoryDto, ['item']) {
  @Exclude()
  item: ItemDto;
}

export class ItemInventoryResDto extends OmitType(InventoryDto, ['food']) {
  @Exclude()
  food: FoodDto;
}

export class BuyRequestQuery {
  @ApiPropertyOptional({
    description: 'Quantity of food or item want to buy',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(100000, { message: 'Quantity must not exceed 100000' })
  @Min(1)
  quantity: number = 1;

  @ApiPropertyOptional({
    name: 'type',
    enum: InventoryType,
    required: false,
    description: 'Type of inventory to buy (item or food)',
    default: InventoryType.ITEM
  })
  @IsOptional()
  @IsEnum(InventoryType)
  type: InventoryType = InventoryType.ITEM;
}
