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
import { DecorPlaceholderService } from './decor-placeholder.service';
import {
  CreateDecorPlaceholderDto,
  DecorPlaceholderQueryDto,
  UpdateDecorPlaceholderDto,
} from './dto/decor-placeholder.dto';

@ApiBearerAuth()
@ApiTags('Decor Placeholder')
@Controller('decor-placeholder')
export class DecorPlaceholderController {
  constructor(
    private readonly placeholderService: DecorPlaceholderService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all decor placeholders' })
  getAll(@Query() query: DecorPlaceholderQueryDto) {
    return this.placeholderService.getAllPlaceholders(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get decor placeholder by id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  getById(@Param('id') id: string) {
    return this.placeholderService.getPlaceholderById(id);
  }

  @Post()
  @RequireAdmin()
  @ApiOperation({ summary: 'Create decor placeholder' })
  create(@Body() dto: CreateDecorPlaceholderDto) {
    return this.placeholderService.createPlaceholder(dto);
  }

  @Patch(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Update decor placeholder' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDecorPlaceholderDto,
  ) {
    return this.placeholderService.updatePlaceholder(id, dto);
  }

  @Delete(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Delete decor placeholder' })
  delete(@Param('id') id: string) {
    return this.placeholderService.deletePlaceholder(id);
  }
}
