import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserClantScoreService } from './user-clant-score.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { UpdateUserClanScoreDto } from './dto/user-clan-score.dto';

@ApiBearerAuth()
@ApiTags('UserClantScore')
@Controller('user-clant-scores')
export class UserClantScoreController {
  constructor(
    private readonly userClantScoreService: UserClantScoreService,
    private readonly clsService: ClsService,
  ) {}

   @Get()
  @ApiOperation({ summary: 'Get all user clan scores' })
  findAll() {
    return this.userClantScoreService.findAll();
  }

  @Get(':user_id/:clan_id')
  @ApiOperation({ summary: 'Get score of a user in a clan' })
  findByUserAndClan(@Param('user_id') userId: string, @Param('clan_id') clanId: string) {
    return this.userClantScoreService.findByUserAndClan(userId, clanId);
  }

  @Patch(':user_id')
  @ApiOperation({ summary: 'Update score record' })
  update(@Param('user_id') userId: string, @Body() dto: UpdateUserClanScoreDto) {
    return this.userClantScoreService.update(userId, dto);
  }

  @Delete(':user_id')
  @ApiOperation({ summary: 'Soft delete score record' })
  delete(@Param('user_id') userId: string) {
    return this.userClantScoreService.delete(userId);
  }

  @Post('reset-weekly')
  @ApiOperation({ summary: 'Reset weekly scores for all users' })
  resetWeekly() {
    return this.userClantScoreService.resetWeekly();
  }
}
