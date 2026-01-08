import { AnimalRarity, MapKey, PetType, SubMap } from '@enum';
import { getExpForNextLevel } from '@libs/utils';
import { UserSummaryDto } from '@modules/admin/users/dto/user-managment.dto';
import { PetPlayersEntity } from '@modules/pet-players/entity/pet-players.entity';
import { PetsDtoResponse } from '@modules/pets/dto/pets.dto';
import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { QueryParamsDto } from '@types';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

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
  current_rarity?: AnimalRarity = AnimalRarity.COMMON;

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
  @ApiPropertyOptional({ type: () => UserSummaryDto })
  @IsOptional()
  @Type(() => UserSummaryDto)
  user: UserSummaryDto | null;
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

export class UpdatePetPlayersDto extends OmitType(PetPlayersInfoDto, [
  'skill_slot_1',
  'skill_slot_2',
  'skill_slot_3',
  'skill_slot_4',
  'pet',
  'max_exp',
  'id',
]) {}

export class CompensateUpdateRarityPetPlayersDto {
  @ApiProperty({ description: 'ID of Pet' })
  @IsUUID()
  pet_id: string;

  @ApiProperty({
    description: 'Rarity of the animal',
    enum: AnimalRarity,
  })
  @IsEnum(AnimalRarity)
  rarity: AnimalRarity;
}
