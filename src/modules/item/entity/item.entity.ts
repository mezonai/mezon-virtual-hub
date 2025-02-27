import { AuditEntity } from '@types';
import { Entity, Column } from 'typeorm';

@Entity({ name: 'item' })
export class Item extends AuditEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  width: number;

  @Column({ type: 'int' })
  height: number;

  @Column({ type: 'boolean', default: false })
  is_equippable: boolean;

  @Column({ type: 'boolean', default: false })
  is_static: boolean;
}
