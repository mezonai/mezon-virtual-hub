// dto/quest-response.dto.ts
import { RewardItemType } from '@enum';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class RewardItemDto {
  @ApiProperty({
    description: 'Reward Id (UUID format)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @IsUUID()
  reward_id: string;

  @ApiProperty({ enum: RewardItemType })
  @IsEnum(RewardItemType)
  type: RewardItemType;

  @ApiProperty({
    description: 'Quantity reward',
    type: Number,
    required: false,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  quantity: number = 1;

  @ApiProperty({
    description: 'Item Id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    required: false,
  })
  @IsUUID()
  @IsOptional()
  item_id?: string;

  @ApiProperty({
    description: 'Food Id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    required: false,
  })
  @IsUUID()
  @IsOptional()
  food_id?: string;
}

export class UpdateRewardItemDto {
  @ApiProperty({
    description: 'Reward Id (UUID format)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @IsUUID()
  reward_id: string;

  @ApiProperty({
    description: 'Quantity reward',
    type: Number,
    required: false,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  quantity: number = 1;
}

export class BulkRewardItemsDTO {
  @ApiProperty({
    description: 'Reward Id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @IsUUID()
  reward_id: string;

  @ApiProperty({
    description: 'List of reward items',
    type: [RewardItemDto],
    example: [
      {
        reward_id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'ITEM',
        quantity: 1,
        item_id: '660e8400-e29b-41d4-a716-446655440111',
      },
      {
        reward_id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'FOOD',
        quantity: 1,
        food_id: '770e8400-e29b-41d4-a716-446655440222',
      },
      {
        reward_id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'GOLD',
        quantity: 1,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RewardItemDto)
  items: RewardItemDto[];
}
