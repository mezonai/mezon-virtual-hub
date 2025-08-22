import { AnimalRarity, MapKey, PetType, SubMap } from '@enum';
import { getExpForNextLevel } from '@libs/utils';
import { UserSummaryDto } from '@modules/admin/users/dto/user-managment.dto';
import { PetPlayersEntity } from '@modules/pet-players/entity/pet-players.entity';
import { PetsDtoResponse } from '@modules/pets/dto/pets.dto';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { QueryParamsDto } from '@types';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class SpawnPetPlayersDto {
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value?.trim() : value))
  species: string;

  @ApiProperty({
    description: 'Rarity of the animal',
    enum: AnimalRarity,
  })
  @IsEnum(AnimalRarity)
  rarity: AnimalRarity = AnimalRarity.COMMON;

  @ApiProperty({
    description: 'Type of the pet.',
    enum: PetType,
  })
  @IsEnum(PetType)
  type: PetType;

  @ApiProperty({
    description: 'Map of the pet.',
    enum: MapKey,
  })
  @IsEnum(MapKey)
  map: MapKey;

  @ApiPropertyOptional({
    description: 'Sub map of the pet.',
    enum: SubMap,
  })
  @IsOptional()
  @IsEnum(SubMap)
  sub_map?: SubMap;

  @ApiProperty({
    description: 'Quantity pet to spawn',
    type: Number,
    required: false,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  quantity: number = 1;
}

export class UpdatePetPlayersDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value?.trim() : value))
  species?: string;

  @ApiPropertyOptional({
    description: 'Rarity of the animal',
    enum: AnimalRarity,
  })
  @IsEnum(AnimalRarity)
  @IsOptional()
  rarity?: AnimalRarity = AnimalRarity.COMMON;

  @ApiProperty({
    description: 'Map of the pet.',
    example: MapKey.HN1,
    enum: MapKey,
  })
  @IsEnum(MapKey)
  @IsOptional()
  map?: MapKey;

  @ApiPropertyOptional({
    description: 'Sub map of the pet.',
    example: SubMap.OFFICE,
    enum: SubMap,
  })
  @IsOptional()
  @IsEnum(SubMap)
  sub_map?: SubMap;
}

@Exclude()
export class PetPlayersListDto extends OmitType(PetPlayersEntity, ['user']) {
  @Expose()
  level: number;

  @Expose()
  stars: number;

  @Expose()
  is_caught: true;

  @Expose()
  created_at: Date;

  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  room_code: string;

  @Expose()
  equipped_skill_codes: [];

  @Expose()
  @Type(() => PetsDtoResponse)
  pet: PetsDtoResponse;

  @Expose()
  @ApiProperty({ type: () => UserSummaryDto })
  @Type(() => UserSummaryDto)
  user: UserSummaryDto;

  @Expose()
  get max_exp(): number {
    return getExpForNextLevel(this.level);
  }
}

export class PetPlayersInfoDto extends OmitType(PetPlayersEntity, ['user']) {
  @Exclude()
  created_at: Date;

  @Exclude()
  updated_at: Date;

  @Expose()
  get max_exp(): number {
    return getExpForNextLevel(this.level);
  }

  @Expose()
  @Type(() => PetsDtoResponse)
  pet: PetsDtoResponse;

  @Expose()
  @ApiProperty({ type: () => UserSummaryDto })
  @Type(() => UserSummaryDto)
  user: UserSummaryDto;
}

export class PetPlayersQueryDto extends QueryParamsDto {
  @ApiPropertyOptional({
    description: 'Rarity of the animal',
    enum: AnimalRarity,
  })
  @IsEnum(AnimalRarity)
  @IsOptional()
  rarity?: AnimalRarity;

  @ApiPropertyOptional({
    description: 'Type of the pet.',
    enum: PetType,
  })
  @IsEnum(PetType)
  @IsOptional()
  pet_type?: PetType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value?.trim() : value))
  species?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_caught?: boolean;
}
