import { InventoryType } from '@enum';
import { FoodEntity } from '@modules/food/entity/food.entity';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { AuditEntity } from '@types';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity({ name: 'inventory' })
export class Inventory extends AuditEntity {
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    name: 'inventory_type',
    type: 'enum',
    enum: InventoryType,
    enumName: 'inventory_type_enum'
  })
  inventory_type: InventoryType;

  @ManyToOne(() => ItemEntity, item => item.inventories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: ItemEntity;

  @ManyToOne(() => FoodEntity, food => food.inventories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'food_id' })
  food: FoodEntity;

  @Column({ type: 'boolean', default: false })
  equipped: boolean;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}
