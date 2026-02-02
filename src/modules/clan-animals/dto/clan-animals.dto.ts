import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class GetListClanAnimalsDto {
  @ApiProperty({
    description: 'Clan id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @IsUUID()
  clan_id: string;

  @ApiProperty({
    description: 'Is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  is_active?: boolean;
}

export class PickupIngredientsDto {
  @ApiProperty({
    description: 'Clan id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @IsUUID()
  clan_id: string;

  @ApiProperty({
    description: 'Item id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  item_id?: string;

  @ApiProperty({
    description: 'Plant id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  plant_id?: string;
}
