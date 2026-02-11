import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { Exclude } from 'class-transformer';
import { InventoryClanType } from '@enum';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { ItemEntity } from '@modules/item/entity/item.entity';

@Entity({ name: 'clan_warehouses' })
export class ClanWarehouseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id', primaryKeyConstraintName: 'PK_clan_warehouse_id' })
  id: string;

  @ApiProperty({ description: 'FK to clan.id' })
  @Column({ type: 'uuid' })
  clan_id: string;

  @Column({ type: 'uuid', nullable: true })
  plant_id?: string;

  @ManyToOne(() => PlantEntity, { nullable: true })
  @JoinColumn({ name: 'plant_id' })
  plant?: PlantEntity;

  @Column({ type: 'uuid', nullable: true })
  item_id?: string;

  @ManyToOne(() => ItemEntity, { nullable: true })
  @JoinColumn({ name: 'item_id' })
  item?: ItemEntity;

  @ApiProperty({ enum: InventoryClanType, description: 'Type of item (PLANT, MATERIAL, TOOL, etc.)' })
  @IsEnum(InventoryClanType)
  @Column({ type: 'varchar', length: 50, nullable: false })
  type: InventoryClanType;

  @ApiProperty({ description: 'Quantity of this item in warehouse' })
  @IsInt()
  @Column({ type: 'int', default: 0 })
  quantity: number;

  @ApiProperty({ description: 'Whether this item has been harvested' })
  @Column({ type: 'boolean', default: false })
  is_harvested: boolean;

  @Exclude()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => ClanEntity, (clan) => clan.warehouse)
  @JoinColumn({ name: 'clan_id', foreignKeyConstraintName: 'FK_clan_id_warehouse' })
  clan: ClanEntity;

  @ApiProperty({ description: 'User who purchased this item for the clan', required: false })
  @Column({ type: 'uuid', nullable: true })
  purchased_by?: string;

}
