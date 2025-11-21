import { ClanActivityActionType } from '@enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity({ name: 'clan_activitys' })
export class ClanActivityEntity {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_clan_activitys_id' })
  id: string;

  @Column('uuid')
  @ApiProperty()
  @IsString()
  clan_id: string;

  @Column('uuid', { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  user_id?: string;

  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ enum: ClanActivityActionType })
  @IsEnum(ClanActivityActionType)
  action_type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  item_name?: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  quantity?: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  amount?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  office_name?: string;

  @CreateDateColumn({ type: 'timestamp' })
  @ApiProperty({
    description: 'The timestamp when this activity log was created',
  })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  @ApiProperty({
    required: false,
    description:
      'The timestamp when this activity log was soft-deleted, if applicable',
  })
  deleted_at?: Date;
}
