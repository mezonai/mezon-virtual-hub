import { Gender, MapKey, SubMap } from '@enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEnum, IsInt, IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';

export class AnimalDtoResponse {
  @Exclude()
  catch_percent: boolean;
}

export class AnimalDtoRequest {
  @ApiPropertyOptional({
    description: 'Species of the animal to filter by.',
    example: 'lion',
  })
  @IsOptional()
  @IsString()
  species?: string;

  @ApiPropertyOptional({
    description: 'Name of the animal to filter by.',
    example: 'Leo',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Catch percentage of the animal.',
    example: 80,
  })
  @IsOptional()
  @IsNumberString()
  catch_percent?: number;

  @ApiProperty({
    description: 'Map of the animal.',
    example: MapKey.HN1,
    enum: MapKey,
  })
  @IsEnum(MapKey)
  map: MapKey;

  @ApiPropertyOptional({
    description: 'Sub map of the animal.',
    example: SubMap.OFFICE,
    enum: SubMap,
  })
  @IsOptional()
  @IsEnum(SubMap)
  sub_map?: SubMap;
}

export class BringPetsDto {
  @ApiProperty({
    description: 'Array of pet IDs to bring with the player (UUID format)',
    example: ['550e8400-e29b-41d4-a716-446655440000', '123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  animal_ids: string[];

  @ApiProperty({
    description: 'Optional flag to indicate whether the pets should be marked as brought (true) or unbrought (false). Defaults to true.',
    example: true,
    default: true,
  })
  @IsOptional()
  is_brought: boolean = true;
}
