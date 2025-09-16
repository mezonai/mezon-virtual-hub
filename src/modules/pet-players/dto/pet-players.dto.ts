import { AnimalRarity, MapKey, PetType, SkillCode, SubMap } from '@enum';
import { PetsDtoResponse } from '@modules/pets/dto/pets.dto';
import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PetPlayersEntity } from '../entity/pet-players.entity';
import { PetSkillsResponseDto } from '@modules/pet-skills/dto/pet-skills.dto';
import { getExpForNextLevel } from '@libs/utils';

export class SpawnPetPlayersDto extends PickType(PetPlayersEntity, [
  'room_code',
]) {
  @ApiPropertyOptional()
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

  @ApiPropertyOptional({
    description: 'Type of the pet.',
    enum: PetType,
  })
  @IsEnum(PetType)
  @IsOptional()
  type?: PetType;

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

  @ApiPropertyOptional({ description: 'ID of User' })
  @IsUUID()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({ description: 'ID of Pet' })
  @IsUUID()
  @IsOptional()
  pet_id?: string;
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
    return getExpForNextLevel(this.level);
  }
}

export class PetPlayersInfoDto extends PetPlayersEntity {
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

export class UpdatePetBattleSlotDto extends PickType(PetPlayersEntity, [
  'battle_slot',
]) {
  @ApiProperty({
    description: 'PetPlayers Id to select for battle (UUID format)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @IsUUID()
  id: string;
}

export class BulkUpdateBattleSlotsDto {
  @ApiProperty({
    description: 'PetPlayers to selected for battle',
    type: [UpdatePetBattleSlotDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => UpdatePetBattleSlotDto)
  pets: UpdatePetBattleSlotDto[];
}

export class UpdateBattleSkillsDto extends PickType(PetPlayersEntity, [
  'equipped_skill_codes',
]) {}

export class BattlePetPlayersDto extends PetPlayersEntity {
  @Exclude()
  created_at: Date;

  @Exclude()
  updated_at: Date;

  @Expose()
  @Type(() => PetsDtoResponse)
  pet: PetsDtoResponse;

  @Exclude()
  skill_slot_1: PetSkillsResponseDto;

  @Exclude()
  skill_slot_2: PetSkillsResponseDto;

  @Exclude()
  skill_slot_3: PetSkillsResponseDto;

  @Exclude()
  skill_slot_4: PetSkillsResponseDto;

  @Exclude()
  equipped_skill_codes: SkillCode[];

  @Expose()
  @Type(() => PetSkillsResponseDto)
  equipped_skills: PetSkillsResponseDto[];

  @Expose()
  get max_exp(): number {
    return getExpForNextLevel(this.level);
  }
}

export class MergePetsDto {
  @ApiProperty({
    description: 'IDs of the 3 pets to merge',
    type: [String],
    example: [
      '91bea29f-0e87-42a5-b851-d9d0386ac32f',
      '3439e988-f9ff-450c-87bf-3f824e332e90',
      '6c46748a-484c-44a2-9df1-2079d22be456',
    ],
  })
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @IsUUID('all', { each: true })
  pet_ids: string[];

  @ApiProperty({
    description:
      'If true, keep base pet individual_value without recalculation',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  keep_individual_value?: boolean;
}
