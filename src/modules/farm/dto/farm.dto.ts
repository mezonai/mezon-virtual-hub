import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateSlotDto {
  @ApiPropertyOptional({ description: 'Quantity slot', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity_slot?: number;
}

export class SlotResponseDto {
  id: string;
  slot_index: number;
  current_slot_plant_id: string | null;
}

export class FarmResponseDto {
  id: string;
  clan_id: string;
  name: string;
  quantity_slot: number;
  slots: SlotResponseDto[];
}
