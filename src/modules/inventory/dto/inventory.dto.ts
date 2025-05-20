import { FoodDto } from '@modules/food/dto/food.dto';
import { ItemDto } from '@modules/item/dto/item.dto';
import { OmitType } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

export class InventoryDto {
  @Expose()
  id: string;

  @Exclude()
  equipped: boolean;

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