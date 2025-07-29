import { AnimalRarity, MapKey, PetType, SkillCode, SubMap } from '@enum';
import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PetPlayersEntity } from '../entity/pet-players.entity';
import { PetSkillsEntity } from '@modules/pet-skills/entity/pet-skills.entity';
import { PetsDtoResponse } from '@modules/pets/dto/pets.dto';

export class SpawnPetPlayersDto {
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value?.trim() : value))
  species: string;

  @ApiPropertyOptional({
    description: 'Rarity of the animal',
    enum: AnimalRarity,
  })
  @IsEnum(AnimalRarity)
  rarity: AnimalRarity = AnimalRarity.COMMON;

  @ApiProperty({
    description: 'Map of the pet.',
    example: MapKey.HN1,
    enum: MapKey,
  })
  @IsEnum(MapKey)
  map: MapKey;

  @ApiPropertyOptional({
    description: 'Sub map of the pet.',
    example: SubMap.OFFICE,
    enum: SubMap,
  })
  @IsOptional()
  @IsEnum(SubMap)
  sub_map?: SubMap;
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

export class PetPlayersWithSpeciesDto extends PetPlayersEntity {
  @Expose()
  id: string;

  @Exclude()
  created_at: Date;

  @Exclude()
  updated_at: Date;

  @Expose()
  get max_exp(): number {
    return Math.pow(this.level, 3);
  }
}

export class PetPlayersInfoDto extends PetPlayersEntity {
  @Exclude()
  created_at: Date;

  @Exclude()
  updated_at: Date;

  @Expose()
  get max_exp(): number {
    return Math.pow(this.level, 3);
  }

  @Expose()
  @Type(() => PetsDtoResponse)
  pet: PetsDtoResponse;
}

export class BringPetPlayersDto {
  @ApiProperty({
    description: 'PetPlayers Id to bring with the player (UUID format)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description:
      'Optional flag to indicate whether the pets should be marked as brought (true) or unbrought (false). Defaults to true.',
    example: true,
    default: true,
  })
  @IsOptional()
  is_brought: boolean = true;
}

export class BringPetPlayersDtoList {
  @ApiProperty({
    description: 'PetPlayers to bring with the player',
    type: [BringPetPlayersDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => BringPetPlayersDto)
  pets: BringPetPlayersDto[];
}

export class SelectPetPlayersDto {
  @ApiProperty({
    description: 'PetPlayers Id to select for battle (UUID format)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description:
      'Optional flag to indicate whether the pets should be marked as selected (true) or not (false). Defaults to true.',
    example: true,
    default: true,
  })
  @IsOptional()
  is_selected_battle: boolean = true;
}

export class SelectPetPlayersListDto {
  @ApiProperty({
    description: 'PetPlayers to selected for battle',
    type: [SelectPetPlayersDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => SelectPetPlayersDto)
  pets: SelectPetPlayersDto[];
}
