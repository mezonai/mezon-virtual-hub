import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { UserService } from './user.service';
import { ClsService } from 'nestjs-cls';
import { USER_TOKEN } from '@constant';
import { UserEntity } from './entity/user.entity';
import { UpdateUserDto, UserInformationDto } from './dto/user.dto';
import { ApiUpdateUser } from '@libs/decorator';

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
  @ApiUpdateUser()
  @ApiResponse({ type: UpdateUserDto })
  async updateUser(@Body() payload: UpdateUserDto) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return await this.userService.updateUser(user.id, payload);
  }
}
