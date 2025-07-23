import { AnimalRarity, MapKey, SubMap } from '@enum';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { PetSkillsEntity } from '../entity/pet-skills.entity';

export class CreatePetSkillsDto extends OmitType(PetSkillsEntity, [
  'pets',
  'skill_code',
] as const) {
  @ApiProperty({
    example: 'NOR00',
  })
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @Matches(/^\S+$/, {
    message: 'skill_code must not contain spaces',
  })
  skill_code: string;
}

export class PetSkillsDtoResponse extends CreatePetSkillsDto {}

export class UpdatePetSkillsDto extends OmitType(PetSkillsEntity, [
  'pets',
  'skill_code',
] as const) {}

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
