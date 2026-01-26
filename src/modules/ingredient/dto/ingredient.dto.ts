import { AnimalRarity } from '@enum';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
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

@Exclude()
export class CreatedPetResponseDto {
  @Expose() 
  level: number;

  @Expose() 
  exp: number;

  @Expose() 
  stars: number;

  @Expose() 
  hp: number;

  @Expose() 
  attack: number;

  @Expose() 
  defense: number;

  @Expose() 
  speed: number;

  @Expose() 
  is_brought: boolean;

  @Expose() 
  is_caught: boolean;

  @Expose() 
  battle_slot: number;

  @Expose() 
  individual_value: number;

  @Expose() 
  current_rarity: AnimalRarity;

  @Expose() 
  name: string | null;
}