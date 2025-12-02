import { ClanFundType } from '@enum';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { QueryParamsDto } from '@types';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ContributeClanFundDto {
  @ApiProperty({ enum: ClanFundType })
  @IsEnum(ClanFundType)
  type: ClanFundType;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  amount: number;
}

export class ContributorClanFundQueryDto extends OmitType(QueryParamsDto, [
  'sort_by',
  'limit',
]) {
  @ApiPropertyOptional({
    description: 'Field name to sort by',
    example: 'total_amount',
    default: 'total_amount',
  })
  @IsOptional()
  @IsString()
  sort_by?: string = 'total_amount';

  @ApiPropertyOptional({
    description: 'Number of results per page',
    example: 30,
    default: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 30;
}
