import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NumberRarityService } from './number-rarity.service';
import { NumberRarityEntity } from '@modules/number-rarity/entity/number-rarity.entity';

@ApiBearerAuth()
@Controller('number-rarity')
@ApiTags('Number Rarity')
export class NumberRarityController {
  constructor(
    private readonly service: NumberRarityService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all number rarity configs' })
  findAll(): Promise<NumberRarityEntity[]> {
    return this.service.findAll();
  }

  @Get(':roomCode')
  @ApiOperation({ summary: 'Get number rarity by room code' })
  findByRoomCode(
    @Param('roomCode') roomCode: string,
  ): Promise<NumberRarityEntity> {
    return this.service.findByRoomCode(roomCode);
  }
}
