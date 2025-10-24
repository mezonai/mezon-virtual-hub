import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { FarmEntity } from '@modules/farm/entity/farm.entity';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'farm_warehouses' })
export class FarmWarehouseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id', primaryKeyConstraintName: 'PK_farm_warehouse_id' })
  id: string;

  @ApiProperty({ description: 'FK to farm.id' })
  @Column({ type: 'uuid' })
  farm_id: string;

  @ApiProperty({ description: 'FK to plant.id' })
  @Column({ type: 'uuid' })
  plant_id: string;

  @ApiProperty({ description: 'Quantity of this plant in warehouse' })
  @IsInt()
  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Exclude()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => FarmEntity, (farm) => farm.warehouseSlots)
  @JoinColumn({ name: 'farm_id', foreignKeyConstraintName: 'FK_farm_id_warehouse' })
  farm: FarmEntity;

  @ManyToOne(() => PlantEntity, (plant) => plant.warehouseSlots)
  @JoinColumn({ name: 'plant_id', foreignKeyConstraintName: 'FK_plant_id_warehouse' })
  plant: PlantEntity;
  
  @ApiProperty({ description: 'Whether this plant has been harvested' })
  @Column({ type: 'boolean', default: false })
  is_harvested: boolean;
}
