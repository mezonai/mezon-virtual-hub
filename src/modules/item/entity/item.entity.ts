import { ItemType } from '@enum';
import { AuditEntity } from '@types';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'item' })
export class ItemEntity extends AuditEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  width: number;

  @Column({ type: 'int', default: 0 })
  height: number;

  @Column({ type: 'int', default: 0 })
  gold: number;

  @Column({ type: 'int', unique: true })
  type: ItemType;

  @Column({ type: 'boolean', default: false })
  is_equippable: boolean;

  @Column({ type: 'boolean', default: false })
  is_static: boolean;
}
