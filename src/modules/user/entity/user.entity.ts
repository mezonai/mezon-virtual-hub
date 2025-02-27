import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { AuditEntity } from '@types';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity({ name: 'user' })
export class User extends AuditEntity {
  @Column({ type: 'varchar', unique: true, nullable: true })
  external_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  auth_provider: string | null;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  avatar_url: string | null;

  @Column({ type: 'int', nullable: true })
  position_x: number | null;

  @Column({ type: 'int', nullable: true })
  position_y: number | null;

  @Column({ type: 'int', nullable: true })
  default_map_id: number | null;

  @OneToMany(() => Inventory, (inventory) => inventory.user)
  inventories: Inventory[];
}
