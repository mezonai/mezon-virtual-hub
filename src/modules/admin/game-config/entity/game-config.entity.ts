import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'game_configs' })
export class GameConfigEntity {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_game_configs_id' })
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ unique: true })
  key: string;

  @Column({ type: 'jsonb' })
  value: any;

  @Column({ default: true })
  enabled: boolean;

  @Column({ default: 1 })
  version: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
