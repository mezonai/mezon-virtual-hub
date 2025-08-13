import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { AdminBypassGuard } from '@libs/guard/admin.guard';
import { ClsService } from 'nestjs-cls';
import { UserManagementService } from './user-management.service';
import {
  UsersManagementQueryDto,
  UpdateUserDto,
} from './dto/user-managment.dto';

@ApiBearerAuth()
@Controller('users')
@ApiTags('Admin - Users')
@UseGuards(AdminBypassGuard)
export class UserManagementController {
  constructor(
    private readonly userService: UserManagementService,
    private readonly logger: Logger,
    private readonly cls: ClsService,
  ) {
    this.logger.setContext(UserManagementController.name);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users information',
  })
  async getAllMaps(@Query() query: UsersManagementQueryDto) {
    return await this.userService.getAllUsers(query);
  }

  @Put(':user_id')
  @ApiParam({
    name: 'user_id',
    example: '91bea29f-0e87-42a5-b851-d9d0386ac32f',
  })
  @ApiOperation({
    summary: 'Update user information',
  })
  @ApiResponse({ type: UpdateUserDto })
  async updateUserInfo(
    @Body() payload: UpdateUserDto,
    @Param('user_id', ParseUUIDPipe) user_id: string,
  ) {
    return await this.userService.updateUserInfo(user_id, payload);
  }
}
