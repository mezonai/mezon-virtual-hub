import { MapKey } from '@enum';
import { AuditEntity } from '@types';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'map' })
export class MapEntity extends AuditEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'enum', enum: MapKey, unique: true })
  map_key: MapKey;

  @Column({ type: 'int', default: 0, nullable: true })
  default_position_x: number | null;

  @Column({ type: 'int', default: 0, nullable: true })
  default_position_y: number | null;

  @Column({ type: 'boolean', default: false })
  is_locked: boolean;
}
