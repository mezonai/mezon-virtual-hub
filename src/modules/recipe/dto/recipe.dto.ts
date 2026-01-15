import { RecipeType } from '@enum';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID, ValidateIf } from 'class-validator';

export class CreateRecipeDto {

  @ValidateIf(o => o.type === RecipeType.PET)
  @ApiPropertyOptional({
    description: 'Pet ID associated with the recipe',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  pet_id?: string;

  @ApiPropertyOptional({
    description: 'Item ID associated with the recipe',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  item_id?: string;

  @ApiProperty({
    description: 'Type of the recipe',
    enum: RecipeType,
    example: RecipeType.PET,
  })
  @IsEnum(RecipeType)
  type: RecipeType;
}

export class UpdateRecipeDto extends PartialType(CreateRecipeDto) {}

export class RecipeQueryDto {
  @ApiProperty({
    description: 'Type of the recipe',
    enum: RecipeType,
    example: RecipeType.PET,
  })
  @IsEnum(RecipeType)
  type: RecipeType;
}
