import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsDate, Max} from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn} from 'typeorm';
import { FarmSlotEntity } from '@modules/farm-slots/entity/farm-slots.entity';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { UserEntity } from '@modules/user/entity/user.entity';

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
  @Column({ type: 'uuid' })
  planted_by: string;

  @Column({ nullable: true })
  last_watered_by?: string;

  @Column({ nullable: true })
  last_bug_caught_by?: string;

  @Column({ nullable: true })
  last_harvested_by?: string;

  @ApiProperty()
  @IsInt()
  @Column({ type: 'int' })
  grow_time_seconds: number;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Column({ type: 'timestamp', nullable: true })
  harvest_at: Date | null;

  @ApiProperty()
  @IsInt()
  @Column({ type: 'int', default: 0 })
  total_water_count: number;

  @ApiProperty()
  @IsInt()
  @Column({ type: 'int', default: 0 })
  total_bug_caught: number;

  @ApiProperty()
  @IsInt()
  @Column({ type: 'int', default: 0 })
  expected_water_count: number;

  @ApiProperty()
  @IsInt()
  @Column({ type: 'int', default: 0 })
  expected_bug_count: number;

  @Column({ type: 'timestamp', nullable: true })
  last_watered_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  need_water_until: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_bug_caught_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  bug_until: Date;

  @IsInt()
  @Column({ type: 'int', default: 0 })
  harvest_count: number;

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
