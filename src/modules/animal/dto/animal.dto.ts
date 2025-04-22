import { Gender, MapKey, SubMap } from '@enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEnum, IsInt, IsNumberString, IsOptional, IsString } from 'class-validator';

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
