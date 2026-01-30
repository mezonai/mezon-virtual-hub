import { AnimalRarity, SkillCode } from '@enum';
import { PetSkillUsageEntity } from '@modules/pet-skill-usages/entity/pet-skill-usages.entity';
import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { PetsEntity } from '../entity/pets.entity';

export class PetsDtoRequest extends OmitType(PetsEntity, [
  'id',
  'pet_skills',
  'updated_at',
  'created_at',
  'skill_usages',
] as const) {
  @ApiProperty({
    type: [String],
    enum: SkillCode,
    description: 'List of unlocked skill codes (max 4)',
    example: ['FIRE03', 'DRAGON01'],
  })
  @IsOptional()
  @IsEnum(SkillCode, { each: true })
  @ArrayMaxSize(4)
  skill_codes: SkillCode[] | null;
}

export class PetsDtoResponse extends PetsEntity {
  @Exclude()
  base_hp: number;

  @Exclude()
  base_attack: number;

  @Exclude()
  base_defense: number;

  @Exclude()
  base_speed: number;

  @Exclude()
  created_at: Date;

  @Exclude()
  updated_at: Date;

  @Exclude()
  skill_usages: PetSkillUsageEntity[];
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
    description:
      'Optional flag to indicate whether the pets should be marked as brought (true) or unbrought (false). Defaults to true.',
    example: true,
    default: true,
  })
  @IsOptional()
  is_brought: boolean = true;
}

export class BringPetsDtoList {
  @ApiProperty({
    description: 'Pet to bring with the player',
    type: [BringPetsDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => BringPetsDto)
  pets: BringPetsDto[];
}

export class UpdatePetSkillIndexItemDto {
  @ApiProperty({ example: 'ELECTRIC02' })
  @IsString()
  skill_code: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(4)
  skill_index: number;
}

export class UpdatePetSkillIndexDto {
  @ApiProperty({ type: [UpdatePetSkillIndexItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePetSkillIndexItemDto)
  skills: UpdatePetSkillIndexItemDto[];
}
