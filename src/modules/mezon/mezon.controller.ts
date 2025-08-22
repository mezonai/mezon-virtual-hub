import { RequireAdmin } from '@libs/decorator';
import { Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { MezonService } from './mezon.service';

@ApiBearerAuth()
@Controller('mezon')
@ApiTags('Mezon')
@RequireAdmin()
export class MezonController {
  constructor(
    private readonly mezonService: MezonService,
    private readonly cls: ClsService,
  ) {}

  @Post('restart')
  @ApiOperation({
    summary: 'Restart mezon bot',
  })
  async restartBot() {
    return await this.mezonService.loginMezon();
  }
}
