import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FragmentService } from './fragment.service';
import {
  CreateFragmentDto,
  UpdateFragmentDto,
} from '@modules/fragment/dto/fragment.dto';
import { ExchangeFragmentDto } from '@modules/slot-wheel/dto/slot-wheel.dto';
import { ClsService } from 'nestjs-cls';
import { USER_TOKEN } from '@constant';
import { UserEntity } from '@modules/user/entity/user.entity';
import { RequireAdmin } from '@libs/decorator';

@ApiBearerAuth()
@ApiTags('Fragment')
@Controller('fragment')
export class FragmentController {
  constructor(
    private readonly fragmentService: FragmentService,
    private readonly cls: ClsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all fragments' })
  getAllFragments() {
    return this.fragmentService.getAllFragments();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fragment by id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Fragment ID',
  })
  getFragmentById(@Param('id') id: string) {
    return this.fragmentService.getFragmentById(id);
  }

  @Post()
  @RequireAdmin()
  @ApiOperation({ summary: 'Create fragment' })
  createFragment(@Query() dto: CreateFragmentDto) {
    return this.fragmentService.createFragment(dto);
  }

  @Patch(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Update fragment' })
  updateFragment(
    @Param('id') id: string,
    @Body() dto: UpdateFragmentDto,
  ) {
    return this.fragmentService.updateFragment(id, dto);
  }

  @Delete(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Delete fragment' })
  deleteFragment(@Param('id') id: string) {
    return this.fragmentService.deleteFragment(id);
  }

  @Post(':id/assemble')
  @ApiOperation({ summary: 'Assemble pet from fragment' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Fragment ID',
  })
  assembleFragment(@Param('id') fragmentId: string) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.fragmentService.assembleFragment(user, fragmentId);
  }

  @Post(':id/exchange')
  @ApiOperation({ summary: 'Exchange excess fragment items' })
  exchangeFragmentItems(@Query() dto: ExchangeFragmentDto) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.fragmentService.exchangeFragmentItems(user, dto);
  }
}
