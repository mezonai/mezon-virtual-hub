import { AnimalRarity, MapKey, SkillCode, SubMap } from '@enum';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PetSpeciesEntity } from '../entity/pet-species.entity';

export class PetSpeciesDtoRequest extends OmitType(PetSpeciesEntity, [
  'id',
  'pet_skills',
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

export class PetSpeciesDtoResponse extends PetSpeciesEntity {}

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
