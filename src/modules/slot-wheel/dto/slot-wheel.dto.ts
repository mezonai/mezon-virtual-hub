import { RewardItemType, SlotWheelType } from "@enum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsUUID } from "class-validator";

export class SlotWheelQueryDto {
  @ApiPropertyOptional({ enum: SlotWheelType })
  @IsOptional()
  @IsEnum(SlotWheelType)
  type?: SlotWheelType;

  @ApiPropertyOptional({ enum: RewardItemType })
  @IsOptional()
  @IsEnum(RewardItemType)
  item_type?: RewardItemType;
}

export class SpinQueryDto {
  @ApiProperty({ enum: SlotWheelType })
  @IsEnum(SlotWheelType)
  type: SlotWheelType;

  @ApiPropertyOptional({
    description: 'Number of reward items',
    type: Number,
    required: false,
    default: 3,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  quantity?: number = 3;

  @ApiPropertyOptional({
    description: 'Fee to spin the slot wheel',
    type: Number,
    required: false,
    default: 100,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  fee?: number = 100;
}

export class CreateSlotWheelDto {
  @ApiProperty({ enum: SlotWheelType })
  @IsEnum(SlotWheelType)
  type: SlotWheelType;

  @ApiProperty({ enum: RewardItemType })
  @IsEnum(RewardItemType)
  type_item: RewardItemType;

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
    description: 'Quantity reward',
    type: Number,
    required: false,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  weight_point: number = 1;

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

  @ApiPropertyOptional({
    description: 'Pet Id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    required: false,
  })
  @IsUUID()
  @IsOptional()
  pet_id?: string;

  @ApiPropertyOptional({
    description: 'Plant Id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    required: false,
  })
  @IsUUID()
  @IsOptional()
  plant_id?: string;
}

export class UpdateSlotWheelDto {
  @ApiPropertyOptional({ enum: SlotWheelType })
  @IsOptional()
  @IsEnum(SlotWheelType)
  type?: SlotWheelType;

  @ApiPropertyOptional({
    description: 'Quantity reward',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Weight point',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight_point?: number;
}