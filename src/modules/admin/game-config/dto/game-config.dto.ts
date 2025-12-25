import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional } from 'class-validator';

export class UpdateGameConfigDto {
  @ApiPropertyOptional({
    description: 'Partial config value',
    example: {
      PLANT: { ENABLE_LIMIT: false },
      HARVEST: { ENABLE_LIMIT: false },
    },
  })
  @IsOptional()
  @IsObject()
  value?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Enable / disable config',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
