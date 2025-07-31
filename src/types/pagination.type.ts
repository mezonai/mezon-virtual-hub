import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber } from 'class-validator';

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
