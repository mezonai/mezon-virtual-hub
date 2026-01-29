import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CreateMapDecorConfigDto {
  @ApiProperty({
    description: 'Clan estate ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  clan_estate_id: string;

  @ApiProperty({
    description: 'Decor placeholder ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  placeholder_id: string;

  @ApiProperty({
    description: 'Decor item ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
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
