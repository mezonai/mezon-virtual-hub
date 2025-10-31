import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserClanStatService } from './user-clan-stat.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { UpdateUserClanStatDto } from './dto/user-clan-stat.dto';

@ApiBearerAuth()
@ApiTags('user-clan-stat')
@Controller('user-clan-stats')
export class UserClanStatController {
  constructor(
    private readonly userClantScoreService: UserClanStatService,
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
  update(@Param('user_id') userId: string, @Body() dto: UpdateUserClanStatDto) {
    return this.userClantScoreService.updateScore(userId, dto);
  }

  @Delete(':user_id')
  @ApiOperation({ summary: 'Soft delete score record' })
  delete(@Param('user_id') userId: string) {
    return this.userClantScoreService.deleteScore(userId);
  }

  @Post('reset-weekly')
  @ApiOperation({ summary: 'Reset weekly scores for all users' })
  resetWeekly() {
    return this.userClantScoreService.resetWeekly();
  }
}
