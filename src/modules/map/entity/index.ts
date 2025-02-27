import { AuditEntity } from '@types';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'map' })
export class Map extends AuditEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'int' })
  width: number;

  @Column({ type: 'int' })
  height: number;
}
