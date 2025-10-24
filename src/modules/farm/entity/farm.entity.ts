import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { FarmSlotEntity } from '@modules/farm-slots/entity/farm-slots.entity';
import { FarmWarehouseEntity } from '@modules/farm-warehouse/entity/farm-warehouse.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'farms' })
export class FarmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @ApiProperty()
  @Column({ type: 'uuid' })
  clan_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', nullable: true })
  name: string;

  @ApiProperty()
  @IsInt()
  @Column({ type: 'int', default: 0 })
  quantity_slot: number;

  @Exclude()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => FarmSlotEntity, (slot) => slot.farm)
  slots: FarmSlotEntity[];

  @OneToMany(() => FarmWarehouseEntity, (wh) => wh.farm)
  warehouseSlots: FarmWarehouseEntity[];
}
