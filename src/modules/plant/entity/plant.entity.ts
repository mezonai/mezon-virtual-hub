import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString} from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SlotsPlantEntity } from '@modules/slots-plant/entity/slots-plant.entity';
import { ClanWarehouseEntity } from '@modules/clan-warehouse/entity/clan-warehouse.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'plants' })
export class PlantEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_plant_id' })
  id: string;

  @ApiProperty({ required: false })
  @IsString()
  @Column({ type: 'varchar', unique: true, nullable: false })
  name: string | null;

  @ApiProperty({ default: 0 })
  @IsInt()
  @Column({ type: 'int', default: 0 })
  grow_time: number;

  @ApiProperty({ default: 0 })
  @IsInt()
  @Column({ type: 'int', default: 0 })
  harvest_point: number;

  @ApiProperty({ default: 0 })
  @IsInt()
  @Column({ type: 'int', default: 0 })
  buy_price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Exclude()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @Exclude()
  @OneToMany(() => SlotsPlantEntity, (slotPlant) => slotPlant.plant)
  slotPlants: SlotsPlantEntity[];

  @Exclude()
  @OneToMany(() => ClanWarehouseEntity, (wh) => wh.plant)
  warehouseSlots: ClanWarehouseEntity[];
}
