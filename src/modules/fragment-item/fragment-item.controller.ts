import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { FragmentItemService } from './fragment-item.service';
import {
  CreateFragmentItemDto,
  UpdateFragmentItemDto,
} from '@modules/fragment-item/dto/fragment-item.dto';
import { RequireAdmin } from '@libs/decorator';

@ApiBearerAuth()
@ApiTags('Fragment Item')
@Controller('fragment-item')
export class FragmentItemController {
  constructor(private readonly fragmentItemService: FragmentItemService) {}

  @Get()
  @ApiParam({
    name: 'fragmentId',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Fragment ID',
  })
  @ApiOperation({ summary: 'Get all fragment items' })
  getAllFragmentItems(@Query('fragmentId') fragmentId: string) {
    return this.fragmentItemService.getAllFragmentItems(fragmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fragment item by id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Fragment item ID',
  })
  getFragmentItemById(@Param('id') id: string) {
    return this.fragmentItemService.getFragmentItemById(id);
  }

  @Post()
  @RequireAdmin()
  @ApiOperation({ summary: 'Create fragment item' })
  createFragmentItem(@Body() dto: CreateFragmentItemDto) {
    return this.fragmentItemService.createFragmentItem(dto);
  }

  @Patch(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Update fragment item' })
  updateFragmentItem(
    @Param('id') id: string,
    @Body() dto: UpdateFragmentItemDto,
  ) {
    return this.fragmentItemService.updateFragmentItem(id, dto);
  }

  @Delete(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Delete fragment item' })
  deleteFragmentItem(@Param('id') id: string) {
    return this.fragmentItemService.deleteFragmentItem(id);
  }
}
