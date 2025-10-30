import { PlantState } from '@enum';
import { SlotsPlantEntity } from '@modules/slots-plant/entity/slots-plant.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';

export class PlantOnSlotDto {
  @IsUUID()
  @ApiProperty({ example: '0b071122-8ac2-4886-a8bd-64e1694f3ba7', description: 'Farm Slot ID' })
  farm_slot_id: string;

  @IsUUID()
  @ApiProperty({ example: '1c23a3d4-abc1-4d7a-b123-1a2b3c4d5e6f', description: 'Plant ID (UUID)' })
  plant_id: string;
}

export class PlantStatusDto {
  @IsUUID()
  @ApiProperty({ example: '1e8bfcfa-d145-44cf-8195-59dd2659c19e', description: 'SlotPlant ID' })
  id: string;

  @IsUUID()
  @ApiProperty({ example: 'e2bb352b-5588-4ba8-aa8c-0483dcfeacff', description: 'Plant ID' })
  plant_id: string;

  @IsString()
  @ApiProperty({ example: 'Broccoli', description: 'Plant name' })
  plant_name: string;

  @IsUUID()
  @ApiProperty({ example: '1f32e9e5-9dc5-4b7d-b71d-4ea9d80c93e4', description: 'User who planted' })
  planted_by: string;

  @IsNumber()
  @ApiProperty({ example: 600, description: 'Grow time in seconds' })
  grow_time: number;

  @ApiProperty({ example: 4, description: 'Current plant stage (enum PlantState)' })
  stage: PlantState;



  @IsDate()
  @ApiProperty({ example: '2025-10-23T21:50:28.720Z', description: 'Harvest date' })
  harvest_at: Date| null;

  @IsDate()
  @ApiProperty({ example: '2025-10-23T21:50:28.720Z', description: 'Created at' })
  created_at: Date;

  @IsDate()
  @ApiProperty({ example: '2025-10-23T21:50:28.720Z', description: 'Updated at' })
  updated_at: Date;
}

export class SlotWithStatusDto {
  @IsUUID()
  @ApiProperty({ example: 'fca20f9f-cd09-47b2-b8fa-27962ee30f84', description: 'Farm slot ID' })
  id: string;

  @IsNumber()
  @ApiProperty({ example: 1, description: 'Slot index' })
  slot_index: number;

  @ValidateNested()
  @Type(() => SlotsPlantEntity)
  @ApiProperty({ type: SlotsPlantEntity, nullable: true, description: 'Current plant info or null' })
  currentPlant: SlotsPlantEntity | null;
}

export class WarehouseSlotDto {
  @IsUUID()
  @ApiProperty({ example: '2d6dd529-b747-486a-9236-66784294ed22', description: 'Warehouse slot ID' })
  id: string;

  @IsUUID()
  @ApiProperty({ example: 'a9fd6aa3-2deb-428a-892d-c939903bc38a', description: 'Farm ID' })
  farm_id: string;

  @IsUUID()
  @ApiProperty({ example: 'e2bb352b-5588-4ba8-aa8c-0483dcfeacff', description: 'Plant ID' })
  plant_id: string;

  @IsNumber()
  @ApiProperty({ example: 4, description: 'Quantity in warehouse' })
  quantity: number;

  @IsBoolean()
  @ApiProperty({ example: false, description: 'Is harvested?' })
  is_harvested: boolean;
}

export class FarmWithSlotsDto {
  @IsUUID()
  @ApiProperty({ example: 'a9fd6aa3-2deb-428a-892d-c939903bc38a', description: 'Farm ID' })
  farm_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotWithStatusDto)
  @ApiProperty({ type: [SlotWithStatusDto], description: 'Farm slots with status' })
  slots: SlotWithStatusDto[];
}

