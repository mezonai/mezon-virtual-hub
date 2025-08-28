import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RewardItemService } from './reward-item.service';
import { RequireAdmin } from '@libs/decorator';
import { Logger } from '@libs/logger';
import { BulkRewardItemsDTO, RewardItemDto, UpdateRewardItemDto } from './dto/reward-item.dto';

@ApiTags('Reward Item')
@Controller('reward-items')
@RequireAdmin()
@ApiBearerAuth()
export class RewardItemController {
  constructor(
    private readonly rewardItemService: RewardItemService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(RewardItemController.name);
  }

  @Get()
  @ApiOperation({
    summary: 'Get list all rewards items',
  })
  async getAllRewardItem() {
    return await this.rewardItemService.getAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new reward item',
  })
  async create(@Query() body: RewardItemDto) {
    return this.rewardItemService.createReward(body);
  }

  @Patch()
  @ApiOperation({
    summary: 'Create new rewards',
  })
  async createRewardItems(@Body() dtos: BulkRewardItemsDTO) {
    return this.rewardItemService.createRewardItems(dtos.reward_id, dtos.items);
  }

  @Put(':reward_item_id')
  @ApiOperation({
    summary: 'Update a existed reward',
  })
  async update(
    @Param('reward_item_id') reward_item_id: string,
    @Query()
    body: UpdateRewardItemDto,
  ) {
    return this.rewardItemService.updateRewardItem(reward_item_id, body);
  }

  @Delete(':reward_item_id')
  @ApiOperation({ summary: 'Delete a reward item by id' })
  async delete(@Param('reward_item_id') id: string) {
    await this.rewardItemService.deleteRewardItem(id);
    return { success: true };
  }
}
