import { Expose } from 'class-transformer';

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
  isStatic: boolean;
}
