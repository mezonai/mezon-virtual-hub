import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsDate, Max, IsEnum, IsBoolean} from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn} from 'typeorm';
import { FarmSlotEntity } from '@modules/farm-slots/entity/farm-slots.entity';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { PlantState } from '@enum';

@Entity({ name: 'slot_plants' })
export class SlotsPlantEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_slot_plant_id',
  })
  id: string;

  @ApiProperty()
  @IsString()
  @Column({ type: 'uuid' })
  farm_slot_id: string;

  @ApiProperty()
  @IsString()
  @Column({ type: 'uuid' })
  plant_id: string;

  @ApiProperty()
  @IsString()
  @Column({ type: 'varchar' })
  plant_name: string;

  @ApiProperty({ enum: PlantState, example: PlantState.GROWING })
  @IsEnum(PlantState)
  @Column({
    type: 'int',
    enum: PlantState,
    default: PlantState.SEED,
  })
  stage: PlantState;

  @Exclude()
  @ApiProperty()
  @IsString()
  @Column({ type: 'uuid' })
  planted_by: string;

  @Exclude()
  @Column({ type: 'uuid', nullable: true })
  last_harvested_by?: string;

  @ApiProperty()
  @IsInt()
  @Column({ type: 'int' })
  grow_time: number;

  @Exclude()
  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Column({ type: 'timestamp', nullable: true })
  harvest_at: Date | null;

  @Exclude()
  @ApiProperty()
  @IsInt()
  @Column({ type: 'int', default: 0 })
  total_water_count: number;

  @Exclude()
  @ApiProperty()
  @IsInt()
  @Column({ type: 'int', default: 0 })
  total_bug_caught: number;

  @Exclude()
  @ApiProperty()
  @IsInt()
  @Column({ type: 'int', default: 0 })
  expected_water_count: number;

  @Exclude()
  @ApiProperty()
  @IsInt()
  @Column({ type: 'int', default: 0 })
  expected_bug_count: number;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  last_watered_at: Date | null;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  need_water_until: Date| null;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  last_bug_caught_at: Date | null;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  bug_until:  Date| null;

  @IsInt()
  @Column({ type: 'int', default: 0 })
  harvest_count: number;

  @Exclude()
  @IsInt()
  @Max(10)
  @Column({ type: 'int', default: 10 })
  harvest_count_max: number;

  @Exclude()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  @ManyToOne(() => FarmSlotEntity, (slot) => slot.historyPlants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'farm_slot_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_slotplant_farmslot',
  })
  farmSlot: FarmSlotEntity;

  @Exclude()
  @ManyToOne(() => PlantEntity, (plant) => plant.slotPlants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'plant_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_slotplant_plant',
  })
  plant: PlantEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'planted_by',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_slotplant_user',
  })
  plantedByUser: UserEntity;
}
