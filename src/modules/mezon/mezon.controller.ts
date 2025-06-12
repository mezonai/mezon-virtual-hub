import { USER_TOKEN } from '@constant';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { MezonService } from './mezon.service';
import { AdminBypassGuard } from '@libs/guard/admin.guard';
import { RefundTokenDto } from './dto/mezon.dto';

@ApiBearerAuth()
@Controller('mezon')
@ApiTags('Mezon')
@UseGuards(AdminBypassGuard)
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

  @Post('refund-token')
  @ApiOperation({
    summary: 'Refund token',
  })
  async refundToken(@Query() query: RefundTokenDto) {
    return await this.mezonService.refundToken(query);
  }
}
