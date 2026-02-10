import { RequireAdmin } from '@libs/decorator';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { RewardService } from './reward.service';
import { CreateRewardDto } from './dto/reward.dto';
import { RewardType } from '@enum';

@ApiTags('Reward')
@Controller('rewards')
@RequireAdmin()
@ApiBearerAuth()
export class RewardController {
  constructor(
    private readonly rewardService: RewardService,
    private readonly cls: ClsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get list all rewards',
  })
  @ApiQuery({
    name: 'type',
    enum: RewardType,
    required: false,
  })
  async getAllRewards(@Query('type') type: RewardType) {
    return await this.rewardService.getAll(type);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new reward',
  })
  async createRewardItem(@Body() payload: CreateRewardDto) {
    return await this.rewardService.createReward(payload);
  }

  @Put(':reward_id')
  @ApiOperation({
    summary: 'Update a existed reward',
  })
  @ApiParam({
    name: 'reward_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  async updateRewardItem(
    @Body() payload: CreateRewardDto,
    @Param('reward_id', ParseUUIDPipe) reward_id: string,
  ) {
    return await this.rewardService.updateReward(reward_id, payload);
  }
}
