import { AnimalRarity, MapKey, SubMap } from '@enum';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
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
import { PetSpeciesEntity } from '@modules/pet-species/entity/pet-species.entity';

export class SpawnPetPlayersDto {
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  species: string;

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

export class PetPlayersDtoResponse extends PetPlayersEntity {
  @Exclude()
  created_at: Date;

  @Exclude()
  updated_at: Date;

  @Transform(
    ({ obj }: { obj: PetPlayersEntity }) => obj.pet_species?.rarity ?? null,
  )
  @Expose()
  readonly rarity?: AnimalRarity;

  @Transform(
    ({ obj }: { obj: PetPlayersEntity }) => obj.pet_species?.species ?? null,
  )
  @Expose()
  readonly species?: string;

  @Transform(
    ({ obj }: { obj: PetPlayersEntity }) =>
      obj.pet_species?.catch_chance ?? null,
  )
  @Expose()
  readonly catch_chance?: number;
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
