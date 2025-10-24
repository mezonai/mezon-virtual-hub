import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'plant_stages' })
export class PlantStageEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_plant_stage_id',
  })
  id: string;

  @ApiProperty()
  @Column({ type: 'uuid' })
  plant_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', unique: true, nullable: true })
  stage_name: string;

  @ApiProperty({
    required: false,
    description:
      'Stage start ratio (0→1). Example: SEED=0, SMALL=0.3, GROWN=0.8, HARVESTABLE=1',
  })
  @IsNumber()
  @Column({ type: 'numeric', default: 0 })
  ratio_start: number;

  @ApiProperty({
    required: false,
    description:
      'Stage end ratio (0→1). null means >=100%. Example: SEED=0.3, SMALL=0.8, GROWN=1, HARVESTABLE=null',
  })
  @IsNumber()
  @IsOptional()
  @Column({ type: 'numeric', nullable: true })
  ratio_end: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
