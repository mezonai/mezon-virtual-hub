import { Gender } from '@enum';
import { AnimalEntity } from '@modules/animal/entity/animal.entity';
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
  display_name: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatar_url: string | null;

  @Column({ type: 'int', default: 0 })
  position_x: number;

  @Column({ type: 'int', default: 0 })
  position_y: number;

  @Column({ type: 'int', default: 0 })
  gold: number;

  @Column({ type: 'int', default: 0 })
  diamond: number;

  @Column({ type: 'varchar' })
  gender: Gender;

  @Column('text', { array: true, nullable: true })
  skin_set: string[];

  @ManyToOne(() => MapEntity, { nullable: false })
  @JoinColumn({ name: 'map_id' })
  map: MapEntity;

  @OneToMany(() => Inventory, (inventory) => inventory.user)
  inventories: Inventory[];

  @OneToMany(() => AnimalEntity, (animal) => animal.user)
  animals: AnimalEntity[] | null;

  @Column({ type: 'bool', default: false })
  has_first_reward: boolean;
}
