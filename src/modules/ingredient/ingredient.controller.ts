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
import { IngredientService } from './ingredient.service';
import { CreateIngredientDto, ExchangeRecipeDto, UpdateIngredientDto } from './dto/ingredient.dto';
import { RequireAdmin } from '@libs/decorator';
import { USER_TOKEN } from '@constant';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ClsService } from 'nestjs-cls';

@ApiBearerAuth()
@ApiTags('Ingredient')
@Controller('ingredient')
export class IngredientController {
  constructor(
    private readonly ingredientService: IngredientService,
    private readonly cls: ClsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all ingredients by recipe' })
  getAllIngredients(@Query('recipeId') recipeId: string) {
    return this.ingredientService.getAllIngredients(recipeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ingredient by id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  getIngredientById(@Param('id') id: string) {
    return this.ingredientService.getIngredientById(id);
  }

  @Post()
  @RequireAdmin()
  @ApiOperation({ summary: 'Create ingredient' })
  createIngredient(@Body() dto: CreateIngredientDto) {
    return this.ingredientService.createIngredient(dto);
  }
  
  @Post('exchange')
  @ApiOperation({ summary: 'Exchange excess fragment items' })
  exchangeFragments(@Query() dto: ExchangeRecipeDto) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.ingredientService.exchangeExcessIngredients(user, dto);
  }

  @Patch(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Update ingredient' })
  updateIngredient(
    @Param('id') id: string,
    @Body() dto: UpdateIngredientDto,
  ) {
    return this.ingredientService.updateIngredient(id, dto);
  }

  @Delete(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Delete ingredient' })
  deleteIngredient(@Param('id') id: string) {
    return this.ingredientService.deleteIngredient(id);
  }

  @Post(':recipe_id/assemble')
  @ApiOperation({ summary: 'Assemble pet from recipe' })
  assembleRecipe(@Param('recipe_id') recipeId: string) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.ingredientService.assembleIngredientToRecipe(user, recipeId);
  }
}
