import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { PetClanType } from '@enum';

export class getListPetClansDto {
  @ApiPropertyOptional({ enum: PetClanType, example: PetClanType.DOG, required: false })
  @IsOptional()
  @IsEnum(PetClanType)
  type?: PetClanType;
}

export class CreatePetClanDto {
  @ApiProperty({ example: 'Alpha Dog' })
  @IsString()
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ enum: PetClanType, example: PetClanType.DOG })
  @IsEnum(PetClanType)
  type: PetClanType;

  @ApiProperty({ example: 0.1, minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  base_rate_affect: number;

  @ApiProperty({ required: false })
  @IsString()
  description?: string;
}

export class UpdatePetClanDto extends PartialType(CreatePetClanDto) {}
