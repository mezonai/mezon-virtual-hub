import { Gender, SortOrder } from '@enum';
import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';
import { UserEntity } from '../entity/user.entity';

export class UsersManagementQueryDto {
  @ApiPropertyOptional({
    description: 'Search keyword to match across multiple user fields',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of results per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field name to sort by',
    example: 'created_at',
    default: 'created_at',
  })
  @IsOptional()
  @IsString()
  sort_by?: string = 'created_at';

  @ApiPropertyOptional({
    description: 'Sort order direction',
    example: 'DESC',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;
}

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
]) {
  @ApiProperty({
    description: 'The map_id of the user',
    type: UUID,
    required: false,
  })
  @IsUUID()
  @IsOptional()
  map_id?: string;

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
}
