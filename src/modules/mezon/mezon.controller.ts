import { RequireAdmin } from '@libs/decorator';
import { Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { MezonService } from './mezon.service';

@ApiBearerAuth()
@Controller('mezon')
@ApiTags('Mezon')
export class MezonController {
  constructor(
    private readonly mezonService: MezonService,
    private readonly cls: ClsService,
  ) {}

  @Post('restart')
  @RequireAdmin()
  @ApiOperation({
    summary: 'Restart mezon bot',
  })
  async restartBot() {
    return await this.mezonService.loginMezon();
  }

  @Get()
  async getReceiverQr() {
    return this.mezonService.generateMezonReceiverQr();
  }
}
