import { RewardItemType, SlotWheelType } from "@enum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsUUID } from "class-validator";

export class SlotWheelQueryDto {
  @ApiProperty({
    description: 'Wheel id',
  })
  @IsUUID()
  wheel_id: string;

  @ApiPropertyOptional({ enum: RewardItemType })
  @IsOptional()
  @IsEnum(RewardItemType)
  type_item?: RewardItemType;
}

export class SpinQueryDto {
  @ApiProperty({
    description: 'Wheel id to spin',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  wheel_id: string;

  @ApiPropertyOptional({
    description: 'Number of reward items',
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quantity?: number = 1;
}

export class CreateSlotWheelDto {
  @ApiProperty({
    description: 'Wheel id',
  })
  @IsUUID()
  wheel_id: string;

  @ApiProperty({ enum: RewardItemType })
  @IsEnum(RewardItemType)
  type_item: RewardItemType;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quantity: number = 1;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight_point: number = 1;

  @ApiPropertyOptional({
    description: 'Item id based on type_item',
  })
  @IsUUID()
  @IsOptional()
  item_id?: string;

  @ApiPropertyOptional({
    description: 'Food id if type_item is FOOD',
  })
  @IsUUID()
  @IsOptional()
  food_id?: string;

  @ApiPropertyOptional({
    description: 'Pet id if type_item is PET',
  })
  @IsUUID()
  @IsOptional()
  pet_id?: string;

  @ApiPropertyOptional({
    description: 'Plant id if type_item is PLANT',
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