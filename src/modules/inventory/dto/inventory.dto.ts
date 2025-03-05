import { ItemDto } from '@modules/item/dto/item.dto';
import { Expose, Type } from 'class-transformer';

export class InventoryDto {
  @Expose()
  id: string;

  @Expose()
  equipped: boolean;

  @Type(() => ItemDto)
  @Expose()
  item: ItemDto;
}
