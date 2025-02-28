import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IResponse<T> {
  @ApiProperty({
    description: 'Application code',
  })
  code: number | string;

  @ApiProperty({
    description: 'Can be success or error message',
  })
  message: string;

  @ApiProperty({
    description: 'Is API success',
  })
  success: boolean;

  @ApiProperty({
    description: 'Result data if exist',
  })
  data: T;

  @ApiPropertyOptional()
  path?: string;

  @ApiPropertyOptional()
  timestamp?: Date;
}
