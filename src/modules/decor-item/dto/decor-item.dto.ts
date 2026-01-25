import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
} from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDecorItemDto {
  @ApiProperty({
    description: 'Decor type',
    example: 'TREE',
  })
  @IsString()
  @MaxLength(50)
  type: string;

  @ApiProperty({
    description: 'Decor name',
    example: 'Cherry Blossom Tree',
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Decor rarity',
    example: 'RARE',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  rarity?: string;
}

export class UpdateDecorItemDto extends PartialType(CreateDecorItemDto) {}

export class DecorItemQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by decor type',
    example: 'TREE',
  })
  @IsOptional()
  @IsString()
  type?: string;
}
