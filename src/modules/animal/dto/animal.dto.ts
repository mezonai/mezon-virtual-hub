import { AnimalRarity, MapKey, SubMap } from '@enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEnum, IsNumber, IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';
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
    description: 'Number of catch chance of the animal.',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  catch_chance?: number;

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

  @ApiPropertyOptional({
    description: 'Rarity of the animal.',
    example: AnimalRarity.COMMON,
    enum: AnimalRarity,
  })
  @IsOptional()
  @IsEnum(AnimalRarity)
  rarity?: AnimalRarity;
}

export class AnimalDtoResponse extends AnimalDtoRequest {
}

export class BringPetsDto {
  @ApiProperty({
    description: 'Pet Id to bring with the player (UUID format)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Optional flag to indicate whether the pets should be marked as brought (true) or unbrought (false). Defaults to true.',
    example: true,
    default: true,
  })
  @IsOptional()
  is_brought: boolean = true;
}
export class BringPetsDtoList {
  @ApiProperty({
    description: 'Pet to bring with the player',
    type: [BringPetsDto]
  })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => BringPetsDto)
  pets: BringPetsDto[];
}