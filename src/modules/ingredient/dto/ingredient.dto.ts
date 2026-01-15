import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateIngredientDto {
  @ApiProperty({
    description: 'ID of the recipe',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  recipe_id: string;

  @ApiProperty({
    description: 'ID of the item',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  item_id: string;

  @ApiProperty({
    description: 'ID of the plant',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  plant_id?: string;

  @ApiProperty({
    description: 'Part number of the ingredient item',
    example: 1,
  })
  @IsInt()
  @Min(1)
  part: number;

  @ApiProperty({
    description: 'Required quantity of the ingredient item',
    example: 1,
  })
  @IsInt()
  @Min(1)
  required_quantity: number;
}

export class UpdateIngredientDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  part?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  required_quantity?: number;
}

export class ExchangeRecipeDto {
  @ApiProperty({
    description: 'Recipe ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  recipeId: string;

  @ApiProperty({
    description: 'Minimum fragments to exchange',
    default: 3,
  })
  @IsNumber()
  @Type(() => Number)
  minExchange: number = 3;
}