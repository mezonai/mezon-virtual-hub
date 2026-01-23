import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, Min } from 'class-validator';
import { RewardItemType, SlotWheelType } from '@enum';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { FoodEntity } from '@modules/food/entity/food.entity';
import { Exclude, Type } from 'class-transformer';
import { FoodDto } from '@modules/food/dto/food.dto';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { PetsDtoResponse } from '@modules/pets/dto/pets.dto';
import { ItemDto } from '@modules/item/dto/item.dto';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { WheelEntity } from '@modules/wheel/entity/wheel.entity';

@Entity('slot_wheel')
export class SlotWheelEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_slot_wheel_id',
  })
  id: string;

  @ApiProperty({ enum: RewardItemType })
  @Column({ type: 'varchar', length: 50 })
  @IsEnum(RewardItemType)
  type_item: RewardItemType;

  @ApiProperty()
  @Column({ type: 'int', default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @Column({ type: 'int', default: 1 })
  @IsInt()
  @Min(1)
  weight_point: number;

  @Column({ type: 'uuid', nullable: true })
  @Exclude()
  item_id: string | null;

  @ManyToOne(() => ItemEntity, { nullable: true })
  @JoinColumn({
    name: 'item_id',
    foreignKeyConstraintName: 'FK_slot_wheel_item_id',
  })
  @Type(() => ItemDto)
  item: ItemEntity | null;

  @Column({ type: 'uuid', nullable: true })
  @Exclude()
  food_id: string | null;

  @ManyToOne(() => FoodEntity, { nullable: true })
  @JoinColumn({
    name: 'food_id',
    foreignKeyConstraintName: 'FK_slot_wheel_food_id',
  })
  @Type(() => FoodDto)
  food: FoodEntity | null;

  @Column({ type: 'uuid', nullable: true })
  @Exclude()
  pet_id: string | null;

  @ManyToOne(() => PetsEntity, { nullable: true })
  @JoinColumn({
    name: 'pet_id',
    foreignKeyConstraintName: 'FK_slot_wheel_pet_id',
  })
  @Type(() => PetsDtoResponse)
  pet: PetsDtoResponse | null;

  @Column({ type: 'uuid', nullable: true })
  @Exclude()
  plant_id: string | null;

  @ManyToOne(() => PlantEntity, { nullable: true })
  @JoinColumn({
    name: 'plant_id',
    foreignKeyConstraintName: 'FK_slot_wheel_plant_id',
  })
  @Type(() => PlantEntity)
  plant: PlantEntity | null;

  @Column({ type: 'uuid' })
  @Exclude()
  wheel_id: string;

  @ManyToOne(() => WheelEntity, (wheel) => wheel.slots, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'wheel_id',
    foreignKeyConstraintName: 'FK_slot_wheel_wheel_id',
  })
  wheel: WheelEntity;
}
