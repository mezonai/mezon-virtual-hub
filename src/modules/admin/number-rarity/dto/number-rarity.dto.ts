import { IsValidRoomCode } from "@libs/decorator";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";


export class CreateNumberRarityDto {
  @ApiProperty({
    description: 'Room code where the pet is located.',
    example: 'sg',
  })
  @IsString()
  @IsValidRoomCode()
  room_code: string;

  @ApiProperty({
    description: 'Number of common pets to fill',
    type: Number,
    default: 6,
  })
  @IsNumber()
  @Type(() => Number)
  common_number: number;

  @ApiProperty({
    description: 'Number of rare pets to fill',
    type: Number,
    default: 3,
  })
  @IsNumber()
  @Type(() => Number)
  rare_number: number;

  @ApiProperty({
    description: 'Number of epic pets to fill',
    type: Number,
    default: 1,
  })
  @IsNumber()
  @Type(() => Number)
  epic_number: number;

  @ApiProperty({
    description: 'Number of legendary pets to fill',
    type: Number,
    default: 0,
  })
  @IsNumber()
  @Type(() => Number)
  legendary_number: number;
}

export class UpdateNumberRarityDto extends PartialType(CreateNumberRarityDto) {}