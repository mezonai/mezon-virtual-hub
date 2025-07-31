import { SortOrder } from '@enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
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
