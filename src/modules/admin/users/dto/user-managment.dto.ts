import { Gender, SortOrder } from '@enum';
import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';
import { QueryParamsDto } from '@types';
import { UserEntity } from '@modules/user/entity/user.entity';

export class UsersManagementQueryDto extends QueryParamsDto { }

export class UsersManagementResDto extends UserEntity {
  @Exclude()
  skin_set: string[];

  @Exclude()
  avatar_url: string | null;

  @Exclude()
  position_x: number;

  @Exclude()
  position_y: number;
}

export class UpdateUserDto extends PickType(UserEntity, [
  'gold',
  'diamond',
  'has_first_reward',
  'role',
  'mezon_id',
  'clan_role'
]) {
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
  @Type(() => Number)
  position_x?: number;

  @ApiProperty({
    description: 'position_y of the user',
    type: Number,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
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
    description: 'Whether the user has completed plant tutorial',
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPlantTutorialCompleted?: boolean;

  @ApiProperty({
    description: 'Whether the user has completed pet tutorial',
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPetTutorialCompleted?: boolean;
}

@Exclude()
export class UserSummaryDto extends PickType(UserEntity, [] as const) {
  @Expose()
  id: string;

  @Expose()
  @IsString()
  username: string;
}
