// dto/quest-response.dto.ts
import { FoodType, RewardItemType } from '@enum';
import { RewardItemEntity } from '@modules/reward-item/entity/reward-item.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Column } from 'typeorm';
import { RewardEntity } from '../entity/reward.entity';

export class RewardDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['daily', 'weekly'] })
  frequency: 'daily' | 'weekly';

  @ApiProperty()
  progress: number;

  @ApiProperty()
  total_progress: number;

  @ApiProperty()
  is_completed: boolean;

  @ApiProperty()
  is_claimed: boolean;
}

export class RewardsResponseDto {
  @ApiProperty({ type: [RewardDto] })
  daily: RewardDto[];

  @ApiProperty({ type: [RewardDto] })
  weekly: RewardDto[];
}

export class CreateRewardDto extends PickType(RewardEntity, [
  'description',
  'name',
  'type',
]) {}
