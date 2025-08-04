import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Logger } from '@libs/logger';

import { AdminBypassGuard } from '@libs/guard/admin.guard';
import { ClsService } from 'nestjs-cls';
import { UserManagementService } from './user-management.service';
import { UsersManagementQueryDto } from './dto/user-managment.dto';

@ApiBearerAuth()
@Controller('admin/users')
@ApiTags('Users Management')
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
}
