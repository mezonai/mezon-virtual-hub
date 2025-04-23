import { ItemEntity } from '@modules/item/entity/item.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { AuditEntity } from '@types';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne
} from 'typeorm';

@Entity({ name: 'inventory' })
export class Inventory extends AuditEntity {
  @ManyToOne(() => UserEntity, (user) => user.inventories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => ItemEntity)
  @JoinColumn({ name: 'item_id' })
  item: ItemEntity;

  @Column({ type: 'boolean', default: false })
  equipped: boolean;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}
