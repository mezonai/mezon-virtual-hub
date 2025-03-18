import { MapKey } from '@enum';
import { AuditEntity } from '@types';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'map' })
export class MapEntity extends AuditEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'enum', enum: MapKey, unique: true })
  map_key: MapKey;

  @Column({ type: 'int' })
  width: number;

  @Column({ type: 'int' })
  height: number;

  @Column({ type: 'int', default: 0 })
  default_position_x: number;

  @Column({ type: 'int', default: 0 })
  default_position_y: number;

  @Column({ type: 'boolean', default: false })
  is_locked: boolean;
}
