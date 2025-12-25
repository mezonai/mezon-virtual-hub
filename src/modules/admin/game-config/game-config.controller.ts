import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { gameConfigService } from './game-config.service';
import { UpdateGameConfigDto } from './dto/game-config.dto';
import { RequireAdmin } from '@libs/decorator';

@ApiBearerAuth()
@ApiTags('GameConfig')
@RequireAdmin()
@Controller('game-configs')
export class GameConfigController {
  constructor(
    private readonly gameConfigService: gameConfigService,
    private readonly clsService: ClsService,
  ) {}

  @Get()
  findAll() {
    return this.gameConfigService.findAll();
  }

  @Put(':key')
  @ApiBody({ type: UpdateGameConfigDto })
  async update(
    @Param('key') key: string,
    @Body() body: UpdateGameConfigDto,
  ) {
    await this.gameConfigService.update(key, body);
    return { success: true };
  }
}
