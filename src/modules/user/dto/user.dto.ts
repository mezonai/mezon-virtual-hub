import { ClanRole, Gender, ScoreType } from '@enum';
import { ClanInfoResponseDto } from '@modules/clan/dto/clan.dto';
import { InventoryDto } from '@modules/inventory/dto/inventory.dto';
import { PetPlayersWithSpeciesDto } from '@modules/pet-players/dto/pet-players.dto';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';
import { UserEntity } from '../entity/user.entity';
import { QueryParamsDto } from '@types';

export class UserPrivateDto {
  @Exclude()
  deleted_at: Date | null;

  @Exclude()
  updated_at: Date | null;

  @Exclude()
  created_at: Date | null;

  @Exclude()
  external_id: string | null;

  @Exclude()
  mezon_id: string | null;

  @Exclude()
  auth_provider: string | null;

  @Exclude()
  role: number;

  @Type(() => ClanInfoResponseDto)
  @Expose()
  clan: ClanInfoResponseDto | null;

  @Type(() => InventoryDto)
  @Expose()
  inventories: InventoryDto[];
}

export class UpdateInfoDto {
  @ApiProperty({
    description: 'The clan_id of the user',
    type: UUID,
    required: false,
  })
  @IsUUID()
  @IsOptional()
  clan_id?: string;

  @ApiProperty({
    description: 'position_x of the user',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  position_x?: number;

  @ApiProperty({
    description: 'position_y of the user',
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  position_y?: number;

  @ApiProperty({
    description: 'The display name of the user',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  display_name?: string;

  @ApiProperty({
    description: 'The gender of the user',
    enum: Gender,
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({
    description: 'The skin set of the user',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skin_set?: string[];
}

export class UserInformationDto extends UserPrivateDto {}

export class UserWithPetPlayers extends UserEntity {
  pet_players: PetPlayersWithSpeciesDto[];
}

@Exclude()
export class UserPublicDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  display_name: string | null;

  @Expose()
  avatar_url: string | null;

  @Expose()
  gender: Gender | null;

  @Expose()
  clan_role: ClanRole;
}

export class UsersClanQueryDto extends OmitType(QueryParamsDto, [
  'sort_by',
  'limit',
]) {
  @ApiPropertyOptional({
    description: 'Field name to sort by',
    example: 'created_at',
    default: 'created_at',
  })
  @IsOptional()
  @IsString()
  sort_by?: string = 'created_at';

  @ApiPropertyOptional({
    description: 'Number of results per page',
    example: 30,
    default: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 30;

  @ApiPropertyOptional({
    description: 'Filter by weekly score',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isWeekly?: boolean;
}
