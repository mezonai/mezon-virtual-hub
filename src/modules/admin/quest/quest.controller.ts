import { RequireAdmin } from '@libs/decorator';
import {
  Body,
  Controller,
  Delete,
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
import { QuestManagementService } from './quest.service';
import { CreateQuestManagementDto } from './dto/quest.dto';

@ApiTags('Admin - Quest')
@Controller('quests')
@RequireAdmin()
@ApiBearerAuth()
export class QuestManagementController {
  constructor(
    private readonly questService: QuestManagementService,
    private readonly cls: ClsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get list all quests',
  })
  async getAllQuestManagements() {
    return await this.questService.getAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new quest',
  })
  async createQuestManagementItem(@Query() payload: CreateQuestManagementDto) {
    return await this.questService.createQuestManagement(payload);
  }

  @Put(':quest_id')
  @ApiOperation({
    summary: 'Update a existed quest',
  })
  @ApiParam({
    name: 'quest_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  async updateQuestManagementItem(
    @Body() payload: CreateQuestManagementDto,
    @Param('quest_id', ParseUUIDPipe) quest_id: string,
  ) {
    return await this.questService.updateQuestManagement(quest_id, payload);
  }

  @Delete(':quest_id')
  @ApiParam({
    name: 'quest_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'HARD delete a quest',
  })
  async deletePetPlayers(
    @Param('quest_id', ParseUUIDPipe) quest_id: string,
  ) {
    return await this.questService.delete(quest_id);
  }
}
