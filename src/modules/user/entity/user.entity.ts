import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { MapEntity } from '@modules/map/entity/map.entity';
import { AuditEntity } from '@types';
import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'user' })
export class UserEntity extends AuditEntity {
  @Column({ type: 'varchar', unique: true, nullable: true })
  external_id: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  mezon_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  auth_provider: string | null;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  avatar_url: string | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  position_x: number | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  position_y: number | null;

  @ManyToOne(() => MapEntity, { nullable: true })
  @JoinColumn({ name: 'map_id' })
  map: MapEntity | null;

  @OneToMany(() => Inventory, (inventory) => inventory.user)
  inventories: Inventory[];
}
