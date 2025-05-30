import { Gender, ItemType } from '@enum';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { AuditEntity } from '@types';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity({ name: 'item' })
export class ItemEntity extends AuditEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', default: Gender.NOT_SPECIFIED })
  gender: Gender = Gender.NOT_SPECIFIED;

  @Column({ type: 'int', default: 0 })
  gold: number;

  @Column({ type: 'int' })
  type: ItemType;

  @Column({ type: 'boolean', default: false })
  is_equippable: boolean;

  @Column({ type: 'boolean', default: false })
  is_static: boolean;

  @Column({ type: 'boolean', default: false })
  is_stackable: boolean;

  @OneToMany(() => Inventory, inventory => inventory.item)
  inventories: Inventory[];
}
