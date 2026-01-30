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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RequireAdmin } from '@libs/decorator';
import { DecorItemService } from './decor-item.service';
import {
  CreateDecorItemDto,
  DecorItemQueryDto,
  UpdateDecorItemDto,
} from './dto/decor-item.dto';

@ApiBearerAuth()
@ApiTags('Decor Item')
@Controller('decor-item')
export class DecorItemController {
  constructor(
    private readonly decorItemService: DecorItemService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all decor items' })
  getAllDecorItems(@Query() query: DecorItemQueryDto) {
    return this.decorItemService.getAllDecorItems(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get decor item by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  getDecorItemById(@Param('id') id: string) {
    return this.decorItemService.getDecorItemById(id);
  }

  @Post()
  @RequireAdmin()
  @ApiOperation({ summary: 'Create decor item' })
  createDecorItem(@Body() dto: CreateDecorItemDto) {
    return this.decorItemService.createDecorItem(dto);
  }

  @Patch(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Update decor item' })
  updateDecorItem(
    @Param('id') id: string,
    @Body() dto: UpdateDecorItemDto,
  ) {
    return this.decorItemService.updateDecorItem(id, dto);
  }

  @Delete(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Delete decor item' })
  deleteDecorItem(@Param('id') id: string) {
    return this.decorItemService.deleteDecorItem(id);
  }
}
