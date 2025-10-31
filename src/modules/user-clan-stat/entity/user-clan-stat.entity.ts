import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsDate, IsInt, IsUUID } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'user-clan-stats' })
export class UserClanStatEntity {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_user_clant_scores_id' })
  id: string;

  @ApiProperty({
    description: 'User ID who owns this score record',
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => UserEntity, (user) => user.scores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ApiProperty({
    description: 'Clan ID associated with this score record (nullable)',
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  @Column({ type: 'uuid', nullable: false })
  clan_id: string;

  @ManyToOne(() => ClanEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'clan_id' })
  clan: ClanEntity;

  @ApiProperty({
    description: 'Total score accumulated by the user in this clan (does not reset)',
    type: 'integer',
    example: 1200,
  })
  @IsInt()
  @Column({ type: 'int', default: 0 })
  total_score: number;

  @ApiProperty({
    description: 'Weekly score of the user (resets every week)',
    type: 'integer',
    example: 250,
  })
  @IsInt()
  @Column({ type: 'int', default: 0 })
  weekly_score: number;

  @ApiProperty({
    description: 'Timestamp of the last weekly reset (nullable)',
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  @IsDate()
  @Column({ type: 'timestamptz', nullable: true })
  last_reset_at: Date;

  @ApiProperty({
    description: 'Record creation timestamp',
    type: 'string',
    format: 'date-time',
  })
  @Exclude()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    type: 'string',
    format: 'date-time',
  })
  @Exclude()
  @UpdateDateColumn()
  updated_at: Date;

  @ApiProperty({
    description: 'Soft delete timestamp (nullable)',
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  @Exclude()
  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  @ApiProperty({
    description: 'Number of times the user has harvested plants',
    type: 'integer',
    example: 10,
  })
  @Column({ type: 'int', default: 0 })
  harvest_count: number; // number of times the user harvested plants

  @ApiProperty({
    description: 'Number of times the user has interrupted other players’ harvests',
    type: 'integer',
    example: 10,
  })
  @Column({ type: 'int', default: 0 })
  harvest_interrupt_count: number; // number of times the user interrupted harvests

  @ApiProperty({
    description: 'Number of times the user has harvested plants use',
    type: 'integer',
    example: 10,
  })
  @Column({ type: 'int', default: 0 })
  harvest_count_use: number; // number of times the user harvested plants

  @ApiProperty({
    description: 'Number of times the user has interrupted other players’ harvests use',
    type: 'integer',
    example: 10,
  })
  @Column({ type: 'int', default: 0 })
  harvest_interrupt_count_use: number; // number of times the user interrupted harvests
}
