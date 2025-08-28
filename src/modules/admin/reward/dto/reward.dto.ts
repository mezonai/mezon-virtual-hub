import { FoodType, ItemType, RewardType } from '@enum';
import { RewardEntity } from '@modules/reward/entity/reward.entity';
import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { Column } from 'typeorm';

export class RewardManagementDto {
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

export class RewardManagementsResponseDto {
  @ApiProperty({ type: [RewardManagementDto] })
  daily: RewardManagementDto[];

  @ApiProperty({ type: [RewardManagementDto] })
  weekly: RewardManagementDto[];
}

export class CreateRewardManagementDto extends PickType(RewardEntity, [
  'description',
  'name',
  'type',
]) {}

export class QueryRewardDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: RewardType })
  @IsEnum(RewardType)
  @IsOptional()
  type?: RewardType;

  @ApiPropertyOptional({ enum: FoodType })
  @IsEnum(FoodType)
  @IsOptional()
  food_type?: FoodType;

  @ApiPropertyOptional({ enum: ItemType })
  @IsEnum(ItemType)
  @IsOptional()
  @Type(() => Number)
  item_type?: ItemType;
}
