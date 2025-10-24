import { PlantStatusDto } from '@modules/farm-slots/dto/farm-slot.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsUUID, IsOptional } from 'class-validator';

export class BuyPlantDto {
  @ApiProperty({ example: '0b071122-8ac2-4886-a8bd-64e1694f3ba7', description: 'Clan farm ID' })
  @IsUUID()
  farmId: string;

  @ApiProperty({ example: '1c23a3d4-abc1-4d7a-b123-1a2b3c4d5e6f', description: 'Plant ID (UUID)' })
  @IsUUID()
  plantId: string;

  @ApiProperty({ example: 5, description: 'Quantity to buy', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class HarvestPlantStatusDto {
  @ApiProperty()
  @IsUUID()
  farmSlotId: string;

  @ApiProperty({ type: PlantStatusDto, nullable: true })
  @IsOptional()
  currentPlant: PlantStatusDto | null;

  @ApiProperty({ required: false })
  @IsOptional()
  harvestedQuantity?: number;

}