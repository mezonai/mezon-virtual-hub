import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsUUID } from 'class-validator';

export class CreateFragmentDto {
  @ApiProperty({
    description: 'Pet ID associated with the fragment',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  pet_id: string;
}

export class UpdateFragmentDto extends PartialType(CreateFragmentDto) {}

export class ExchangeFragmentDto {
  @ApiProperty({
    description: 'Fragment ID to random reward from',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  fragmentId: string;

  @ApiProperty({
    description: 'Minimum fragments to exchange',
    type: Number,
    default: 3,
  })
  @IsNumber()
  @Type(() => Number)
  minExchange: number = 3;
}