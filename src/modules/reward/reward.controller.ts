import { RequireAdmin } from '@libs/decorator';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { RewardService } from './reward.service';

@ApiTags('Reward')
@Controller('rewards')
@RequireAdmin()
@ApiBearerAuth()
export class RewardController {
  constructor(
    private readonly rewardService: RewardService,
    private readonly cls: ClsService,
  ) {}
}
