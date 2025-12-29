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
  ApiTags,
} from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { RewardManagementService } from './reward.service';
import { CreateRewardManagementDto, QueryRewardDto } from './dto/reward.dto';

@ApiTags('Admin - Reward')
@Controller('rewards')
@RequireAdmin()
@ApiBearerAuth()
export class RewardManagementController {
  constructor(
    private readonly rewardService: RewardManagementService,
    private readonly cls: ClsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get list all rewards',
  })
  async getAllRewardManagements(@Query() query: QueryRewardDto) {
    return await this.rewardService.getAll(query);
  }

  @Get("weekly-rewards/members")
  @ApiOperation({
    summary: 'Reward weekly top players',
  })
  async rewardWeeklyTopPlayers() {
    return await this.rewardService.rewardWeeklyTopPlayers();
  }

  @Get("weekly-rewards/clans")
  @ApiOperation({
    summary: 'Reward weekly top clans',
  })
  async rewardWeeklyTopClans() {
    return await this.rewardService.rewardWeeklyTopClans();
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new reward',
  })
  async createRewardManagementItem(@Body() payload: CreateRewardManagementDto) {
    return await this.rewardService.createRewardManagement(payload);
  }

  @Put(':reward_id')
  @ApiOperation({
    summary: 'Update a existed reward',
  })
  @ApiParam({
    name: 'reward_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  async updateRewardManagementItem(
    @Body() payload: CreateRewardManagementDto,
    @Param('reward_id', ParseUUIDPipe) reward_id: string,
  ) {
    return await this.rewardService.updateRewardManagement(reward_id, payload);
  }
}
