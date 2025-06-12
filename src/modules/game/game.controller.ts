import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  Logger,
} from '@nestjs/common';
import { GameService } from './game.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';
import { USER_TOKEN } from '@constant';
import { UserEntity } from '@modules/user/entity/user.entity';
import { AwardResponseDto } from './dto/game.dto';

@ApiTags('Game')
@Controller('game')
@ApiBearerAuth()
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly cls: ClsService,
  ) {}

  @Get('spin')
  @ApiResponse({
    status: 200,
    description: 'Returns an array of rewards (item, gold, or none)',
    type: [AwardResponseDto],
    examples: {
      success: {
        summary: 'Example response with items and gold',
        value: {
          rewards: [
            {
              type: 'item',
              item: {
                gender: 'male',
                id: '744d48f8-5f39-4a8d-8b43-290f54d1bb42',
                created_at: '2025-03-27T06:39:26.661Z',
                deleted_at: null,
                name: 'Tóc đỏ SonGoKu',
                gold: 1,
                type: 1,
                is_equippable: true,
                is_static: false,
                is_stackable: false,
              },
              quantity: 1,
            },
            {
              type: 'gold',
              amount: 10,
            },
            {
              type: 'item',
              item: {
                gender: 'male',
                id: '3decccf1-ce4a-4be5-9842-f92024deb09c',
                created_at: '2025-03-27T06:39:53.210Z',
                deleted_at: null,
                name: 'Tóc xanh tia chớp',
                gold: 1,
                type: 1,
                is_equippable: true,
                is_static: false,
                is_stackable: false,
              },
              quantity: 1,
            },
          ],
          user_gold: 100,
        }
      },
      noReward: {
        summary: 'Example response with no rewards',
        value: [{ type: 'none' }, { type: 'none' }, { type: 'none' }],
      },
    },
  })
  @ApiOperation({ summary: 'Spin for rewards' })
  async spin() {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return await this.gameService.spinForRewards(user);
  }

  @Post('initial-reward')
  @ApiOperation({ summary: 'Claim initial reward for new user' })
  async claimInitialReward() {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.gameService.giveInitialReward(user);
  }
}
