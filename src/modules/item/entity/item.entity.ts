import { Gender, ItemType } from '@enum';
import { AuditEntity } from '@types';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'item' })
export class ItemEntity extends AuditEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'enum', enum: Gender, default: Gender.NOT_SPECIFIED })
  gender: Gender = Gender.NOT_SPECIFIED;

  @Column({ type: 'int', default: 0 })
  gold: number;

  @Column({ type: 'int' })
  type: ItemType;

  @Column({ type: 'boolean', default: false })
  is_equippable: boolean;

  @Column({ type: 'boolean', default: false })
  is_static: boolean;
}
