// dto/quest-response.dto.ts
import { AnimalRarity, PetType, RewardItemType } from '@enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
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

  @ApiPropertyOptional({
    description: 'Quantity reward',
    type: Number,
    required: false,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  quantity: number = 1;

  @ApiPropertyOptional({
    description: 'Item Id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    required: false,
  })
  @IsUUID()
  @IsOptional()
  item_id?: string;

  @ApiPropertyOptional({
    description: 'Food Id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    required: false,
  })
  @IsUUID()
  @IsOptional()
  food_id?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value?.trim() : value))
  pet_species?: string;

  @ApiPropertyOptional({
    description: 'Rarity of the animal',
    enum: AnimalRarity,
  })
  @IsEnum(AnimalRarity)
  @IsOptional()
  pet_rarity?: AnimalRarity;

  @ApiPropertyOptional({
    description: 'Type of the pet.',
    enum: PetType,
  })
  @IsEnum(PetType)
  @IsOptional()
  pet_type?: PetType;
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
        type: 'item',
        quantity: 1,
        item_id: '660e8400-e29b-41d4-a716-446655440111',
      },
      {
        reward_id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'food',
        quantity: 1,
        food_id: '770e8400-e29b-41d4-a716-446655440222',
      },
      {
        reward_id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'gold',
        quantity: 10,
      },
      {
        reward_id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'pet',
        quantity: 1,
        pet_species: 'Dragon',
        pet_rarity: AnimalRarity.COMMON,
        pet_type: PetType.DRAGON,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RewardItemDto)
  items: RewardItemDto[];
}
