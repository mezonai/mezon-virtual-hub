import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, Min } from 'class-validator';
import { RewardItemType } from '@enum';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { FoodEntity } from '@modules/food/entity/food.entity';
import { RewardEntity } from '@modules/reward/entity/reward.entity';

@Entity('reward_items')
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

  @ManyToOne(() => RewardEntity, (reward) => reward.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'reward_id',
    foreignKeyConstraintName: 'FK_reward_items_reward_id',
  })
  reward: RewardEntity;

  @ManyToOne(() => ItemEntity, { nullable: true })
  @JoinColumn({
    name: 'item_id',
    foreignKeyConstraintName: 'FK_reward_items_item_id',
  })
  item: ItemEntity | null;

  @ManyToOne(() => FoodEntity, { nullable: true })
  @JoinColumn({
    name: 'food_id',
    foreignKeyConstraintName: 'FK_reward_items_food_id',
  })
  food: FoodEntity | null;
}
