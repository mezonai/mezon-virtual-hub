import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
} from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateMapDto {
  @ApiProperty({ example: 'Green Land' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ example: 'Beginner area' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  index: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  is_locked: boolean;
}

export class UpdateMapDto extends PartialType(CreateMapDto) {}

export class MapQueryDto {
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_locked?: boolean;
}
