import { InventoryClanType } from '@enum';
import { SlotsPlantEntity } from '@modules/slots-plant/entity/slots-plant.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min, IsUUID, IsOptional, IsEnum, Max, IsArray } from 'class-validator';

export class BuyItemDto {
  @ApiPropertyOptional({ description: 'Plant ID (UUID)' })
  @IsOptional()
  @IsUUID()
  plantId?: string;

  @ApiPropertyOptional({ description: 'Item ID (UUID)' })
  @IsOptional()
  @IsUUID()
  itemId?: string;

  @ApiPropertyOptional({
    enum: InventoryClanType,
    default: InventoryClanType.PLANT,
  })
  @IsOptional()
  @IsEnum(InventoryClanType)
  type: InventoryClanType = InventoryClanType.PLANT;

  @ApiProperty({ example: 5, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  quantity: number;
}


export class HarvestPlantStatusDto {
  @ApiProperty()
  @IsUUID()
  farmSlotId: string;

  @ApiProperty({ type: SlotsPlantEntity, nullable: true })
  @IsOptional()
  currentPlant: SlotsPlantEntity | null;

  @ApiProperty({ required: false })
  @IsOptional()
  harvestedQuantity?: number;
}

export class SeedClanWarehouseDto {
  @ApiPropertyOptional({
    description: 'Số lượng mặc định cho mỗi item, nếu không truyền sẽ lấy 5',
    example: 5,
  })
  @IsInt()
  @IsOptional()
  defaultQuantity?: number = 5;

  @ApiPropertyOptional({
    description: 'Danh sách item IDs muốn seed, nếu bỏ trống sẽ seed tất cả plants',
    example: [
      '1a2b3c4d-1234-5678-9abc-def123456789',
      '2b3c4d5e-2345-6789-abcd-ef2345678901',
    ],
  })
  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true }) // kiểm tra từng phần tử là UUID version 4
  plantIds?: string[];
}
