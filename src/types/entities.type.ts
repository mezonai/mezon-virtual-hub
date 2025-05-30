import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()', nullable: true })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'now()', nullable: true })
  updated_at: Date;
}
