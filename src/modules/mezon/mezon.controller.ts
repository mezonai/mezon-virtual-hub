import { USER_TOKEN } from '@constant';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { MezonService } from './mezon.service';
import { AdminBypassGuard } from '@libs/guard/admin.guard';

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
  async getAllFoodsOfUser() {
    return await this.mezonService.restartMezon();
  }
}
