import { AuditEntity } from '@types';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { MapEntity } from '@modules/map/entity/map.entity';
import { MapDecorConfigEntity } from '@modules/map-decor-config/entity/map-decor-config.entity';

@Entity({ name: 'decor_placeholders' })
@Unique('UQ_map_placeholder_code', ['map', 'code'])
export class DecorPlaceholderEntity extends AuditEntity {
  @ManyToOne(() => MapEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'map_id',
    foreignKeyConstraintName: 'FK_decor_placeholder_map_id',
  })
  map: MapEntity;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'int', default: 1 })
  position_index: number;

  @OneToMany(() => MapDecorConfigEntity, (cfg) => cfg.placeholder)
  configs: MapDecorConfigEntity[];
}
