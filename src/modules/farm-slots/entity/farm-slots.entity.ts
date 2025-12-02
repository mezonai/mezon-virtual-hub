import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { FarmEntity } from '@modules/farm/entity/farm.entity';
import { SlotsPlantEntity } from '@modules/slots-plant/entity/slots-plant.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'farm_slots' })
export class FarmSlotEntity {
  @ApiProperty()
  @IsUUID()
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_farm_slot_id' })
  id: string;

  @ApiProperty()
  @IsUUID()
  @Column({ type: 'uuid' })
  farm_id: string;

  @ApiProperty()
  @IsInt()
  @Column({ type: 'int' })
  slot_index: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  @Column({ type: 'uuid', nullable: true })
  current_slot_plant_id: string | null;

  @ManyToOne(() => SlotsPlantEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'current_slot_plant_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_farmslot_slotplant' })
  currentSlotPlant?: SlotsPlantEntity | null;

  @Exclude()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => FarmEntity, (farm) => farm.slots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_farm_slot_farm' })
  farm: FarmEntity;

  @OneToMany(() => SlotsPlantEntity, (slotPlant) => slotPlant.farmSlot)
  historyPlants: SlotsPlantEntity[];
}
