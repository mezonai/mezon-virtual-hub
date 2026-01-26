import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CreateMapDecorConfigDto {
  @ApiProperty({
    description: 'Clan estate ID',
  })
  @IsUUID()
  clan_estate_id: string;

  @ApiProperty({
    description: 'Decor placeholder ID',
  })
  @IsUUID()
  placeholder_id: string;

  @ApiProperty({
    description: 'Decor item ID',
  })
  @IsUUID()
  decor_item_id: string;
}

export class MapDecorConfigQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by clan estate id',
  })
  @IsOptional()
  @IsUUID()
  clan_estate_id?: string;
}
