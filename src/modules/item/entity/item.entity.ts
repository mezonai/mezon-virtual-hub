import { ItemType } from '@enum';
import { AuditEntity } from '@types';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'item' })
export class ItemEntity extends AuditEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'int', default: -1 })
  gender: number;

  @Column({ type: 'int', default: 0 })
  gold: number;

  @Column({ type: 'int' })
  type: ItemType;

  @Column({ type: 'boolean', default: false })
  is_equippable: boolean;

  @Column({ type: 'boolean', default: false })
  is_static: boolean;
}
