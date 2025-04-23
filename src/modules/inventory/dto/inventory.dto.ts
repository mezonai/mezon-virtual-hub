import { ItemDto } from '@modules/item/dto/item.dto';
import { Exclude, Expose, Type } from 'class-transformer';

export class InventoryDto {
  @Expose()
  id: string;

  @Expose()
  equipped: boolean;

  @Exclude()
  deleted_at: Date | null;

  @Exclude()
  updated_at: Date | null;

  @Exclude()
  created_at: Date | null;

  @Type(() => ItemDto)
  @Expose()
  item: ItemDto;
}
