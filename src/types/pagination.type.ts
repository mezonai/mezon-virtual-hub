import { SortOrder } from '@enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class Pageable<T> {
  @IsArray()
  @ApiProperty({ isArray: true, name: 'result' })
  readonly result: T[];

  @IsNumber()
  @ApiProperty({ name: 'page', example: 1 })
  readonly page: number;

  @IsNumber()
  @ApiProperty({ name: 'size', example: 10 })
  readonly size: number;

  @IsNumber()
  @ApiProperty({ name: 'total', example: 120 })
  readonly total: number;

  @IsNumber()
  @ApiProperty({ name: 'total_page', example: 12 })
  readonly total_page: number;

  @IsBoolean()
  @ApiProperty({ name: 'has_previous_page', example: true })
  readonly has_previous_page: boolean;

  @IsBoolean()
  @ApiProperty({ name: 'has_next_page', example: false })
  readonly has_next_page: boolean;

  constructor(
    data: T[],
    { size, page, total }: { size: number; page: number; total: number },
  ) {
    const pageCount = Math.ceil(total / size);

    this.result = data;
    this.page = page;
    this.size = size;
    this.total = total;
    this.total_page = pageCount;
    this.has_previous_page = page > 1;
    this.has_next_page = page < pageCount;
  }
}

export class QueryParamsDto {
  @ApiPropertyOptional({
    description: 'Search keyword to match across multiple fields',
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
