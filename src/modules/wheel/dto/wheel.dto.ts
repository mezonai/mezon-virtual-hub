import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { SlotWheelType } from '@enum';
import { Type } from 'class-transformer';

export class WheelQueryDto {
  @ApiPropertyOptional({ enum: SlotWheelType })
  @IsOptional()
  @IsEnum(SlotWheelType)
  type?: SlotWheelType;
}

export class CreateWheelDto {
  @ApiProperty({ enum: SlotWheelType })
  @IsEnum(SlotWheelType)
  type: SlotWheelType;

  @ApiPropertyOptional({
    description: 'Base fee to spin this wheel',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  base_fee?: number = 0;
}

export class UpdateWheelDto {
  @ApiPropertyOptional({ enum: SlotWheelType })
  @IsOptional()
  @IsEnum(SlotWheelType)
  type?: SlotWheelType;

  @ApiPropertyOptional({
    description: 'Base fee to spin this wheel',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  base_fee?: number;
}
