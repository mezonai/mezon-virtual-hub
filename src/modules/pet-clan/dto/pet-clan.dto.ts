import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { PetCLanCode, PetClanType } from '@enum';

export class getListPetClansDto {
  @ApiPropertyOptional({ enum: PetClanType, example: PetClanType.DOG, required: false })
  @IsOptional()
  @IsEnum(PetClanType)
  type?: PetClanType;
}

export class CreatePetClanDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: PetClanType })
  @IsEnum(PetClanType)
  type: PetClanType;

  @ApiProperty({ enum: PetCLanCode })
  @IsEnum(PetCLanCode)
  pet_clan_code: PetCLanCode;

  @ApiProperty({ default: 10 })
  @IsNumber()
  base_rate_affect: number;

  @ApiProperty({ default: 1000 })
  @IsNumber()
  base_exp_per_level: number;

  @ApiProperty({ default: 5 })
  @IsNumber()
  base_exp_increment_per_level: number;

  @ApiProperty({ default: 10 })
  @IsNumber()
  max_level: number;

  @ApiProperty({ default: 0.2 })
  @IsNumber()
  level_up_rate_multiplier: number;
}

export class UpdatePetClanDto extends PartialType(CreatePetClanDto) {}
