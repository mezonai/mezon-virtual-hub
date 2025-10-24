import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export enum PlantState {
  NONE = 0,
  SEED = 1,
  SMALL = 2,
  GROWING = 3,
  HARVESTABLE = 4,
}

export class CreatePlantDto {
  @ApiProperty({ description: 'Name of the plant', example: 'Tomato' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Time in seconds for the plant to grow', example: 3600 })
  @IsNumber()
  growTime: number;

  @ApiProperty({ description: 'Price to buy the plant', example: 5 })
  @IsNumber()
  buyPrice: number;

  @ApiProperty({ description: 'Harvest points', example: 10 })
  @IsNumber()
  harvestPoint: number;

  @ApiProperty({ description: 'Optional description', example: 'A fast-growing tomato' })
  @IsOptional()
  @IsString()
  description?: string;
}