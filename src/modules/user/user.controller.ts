import { Body, Controller, Get, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { USER_TOKEN } from '@constant';
import { ClsService } from 'nestjs-cls';
import { UpdateInfoDto, UserInformationDto } from './dto/user.dto';
import { UserEntity } from './entity/user.entity';
import { UserService } from './user.service';

@ApiBearerAuth()
@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: Logger,
    private readonly cls: ClsService,
  ) {
    this.logger.setContext(UserController.name);
  }

  @Get()
  @ApiOperation({
    summary: 'Get user information',
  })
  @ApiResponse({ type: UserInformationDto })
  async getAllMaps() {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return await this.userService.getUserInformation(user.id);
  }

  @Put()
  @ApiOperation({
    summary: 'Update user information',
  })
  @ApiResponse({ type: UpdateInfoDto })
  async updateUserInfo(@Body() payload: UpdateInfoDto) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return await this.userService.updateUserInfo(user, payload);
  }
}
