import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, Min } from 'class-validator';
import { AnimalRarity, RewardItemType } from '@enum';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { FoodEntity } from '@modules/food/entity/food.entity';
import { RewardEntity } from '@modules/reward/entity/reward.entity';
import { Exclude, Type } from 'class-transformer';
import { FoodDto } from '@modules/food/dto/food.dto';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { PetsDtoResponse } from '@modules/pets/dto/pets.dto';
import { ItemDto } from '@modules/item/dto/item.dto';
import { PlantEntity } from '@modules/plant/entity/plant.entity';

@Entity('reward_items')
@Unique('UQ_reward_items_reward_id_item_id', ['reward_id', 'item_id'])
@Unique('UQ_reward_items_reward_id_food_id', ['reward_id', 'food_id'])
@Unique('UQ_reward_items_reward_id_pet_id', ['reward_id', 'pet_id'])
export class RewardItemEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_reward_items_id',
  })
  id: string;

  @ApiProperty({ enum: RewardItemType })
  @Column({ type: 'varchar', length: 50 })
  @IsEnum(RewardItemType)
  type: RewardItemType;

  @ApiProperty()
  @Column({ type: 'int', default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @Column({ type: 'uuid' })
  reward_id: string;

  @ManyToOne(() => RewardEntity, (reward) => reward.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'reward_id',
    foreignKeyConstraintName: 'FK_reward_items_reward_id',
  })
  reward: RewardEntity;

  @Column({ type: 'uuid', nullable: true })
  @Exclude()
  item_id: string | null;

  @ManyToOne(() => ItemEntity, { nullable: true })
  @JoinColumn({
    name: 'item_id',
    foreignKeyConstraintName: 'FK_reward_items_item_id',
  })
  @Type(() => ItemDto)
  item: ItemEntity | null;

  @Column({ type: 'uuid', nullable: true })
  @Exclude()
  food_id: string | null;

  @ManyToOne(() => FoodEntity, { nullable: true })
  @JoinColumn({
    name: 'food_id',
    foreignKeyConstraintName: 'FK_reward_items_food_id',
  })
  @Type(() => FoodDto)
  food: FoodEntity | null;

  @Column({ type: 'uuid', nullable: true })
  @Exclude()
  pet_id: string | null;

  @ManyToOne(() => PetsEntity, { nullable: true })
  @JoinColumn({
    name: 'pet_id',
    foreignKeyConstraintName: 'FK_reward_items_pet_id',
  })
  @Type(() => PetsDtoResponse)
  pet: PetsDtoResponse | null;

  @Column({ type: 'uuid', nullable: true })
  @Exclude()
  plant_id: string | null;

  @ManyToOne(() => PlantEntity, { nullable: true })
  @JoinColumn({
    name: 'plant_id',
    foreignKeyConstraintName: 'FK_reward_items_plant_id',
  })
  @Type(() => FoodDto)
  plant: PlantEntity | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | { rarity: AnimalRarity } | null;
}
