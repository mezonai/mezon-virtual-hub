import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { NumberRarityService } from '@modules/number-rarity/number-rarity.service';

@ApiBearerAuth()
@Controller('number-rarity')
@ApiTags('Number Rarity')
export class NumberRarityController {
  constructor(
    private readonly service: NumberRarityService,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all number rarity configs' 
  })
  findAll() {
    return this.service.findAll();
  }

  @Get(':roomCode')
  @ApiParam({
    name: 'roomCode',
    example: 'sg',
  })
  @ApiOperation({ 
    summary: 'Get number rarity by room code' 
  })
  findByRoomCode(
    @Param('roomCode') roomCode: string,
  ) {
    return this.service.findByRoomCode(roomCode);
  }
}