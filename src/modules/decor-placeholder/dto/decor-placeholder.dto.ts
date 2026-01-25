import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
} from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateDecorPlaceholderDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Map ID',
  })
  @IsUUID()
  map_id: string;

  @ApiProperty({ example: 'TREE_1' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'TREE' })
  @IsString()
  @MaxLength(50)
  type: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  position_index?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  max_items?: number;
}

export class UpdateDecorPlaceholderDto extends PartialType(
  CreateDecorPlaceholderDto,
) {}

export class DecorPlaceholderQueryDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  map_id?: string;
}
