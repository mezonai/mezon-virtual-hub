import { FoodType, PurchaseMethod } from '@enum';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Max } from 'class-validator';

export class FoodDto {
  @Exclude()
  deleted_at: Date | null;

  @Exclude()
  updated_at: Date | null;

  @Exclude()
  created_at: Date | null;
}

export class FoodDtoRequest {
  @ApiProperty({
    description: 'Name of the food item',
    example: 'Premium Snack',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Food type (NORMAL, PREMIUM, ULTRA_PREMIUM)',
    enum: FoodType,
    example: FoodType.PREMIUM,
  })
  @IsEnum(FoodType)
  type: FoodType;

  @ApiProperty({
    description: 'Currency used to buy this food (GOLD or DIAMOND)',
    enum: PurchaseMethod,
    example: PurchaseMethod.GOLD,
  })
  @IsEnum(PurchaseMethod)
  purchase_method: PurchaseMethod;

  @ApiProperty({
    description: 'Price of the food in the selected currency',
    example: 250,
  })
  @Type(() => Number)
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Description of the food',
    example: 'KERA vegetable candy',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Catch rate bonus of the food (max: 100)',
    example: 15,
  })
  @Type(() => Number)
  @IsNumber()
  @Max(100)
  catch_rate_bonus: number;
}
