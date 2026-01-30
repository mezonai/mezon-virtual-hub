import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class ClanDecorInventoryQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by clan id',
  })
  @IsOptional()
  @IsUUID()
  clan_id?: string;
}
