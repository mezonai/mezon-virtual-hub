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
import { RecipeService } from './recipe.service';
import {
  CreateRecipeDto,
  RecipeQueryDto,
  UpdateRecipeDto,
} from './dto/recipe.dto';
import { RequireAdmin } from '@libs/decorator';
import { USER_TOKEN } from '@constant';
import { UserEntity } from '@modules/user/entity/user.entity';
import { ClsService } from 'nestjs-cls';

@ApiBearerAuth()
@ApiTags('Recipe')
@Controller('recipe')
export class RecipeController {
  constructor(
    private readonly recipeService: RecipeService,
    private readonly cls: ClsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all recipes' })
  getAllRecipes(@Query() query: RecipeQueryDto) {
    const user = this.cls.get<UserEntity>(USER_TOKEN);
    return this.recipeService.getAllRecipes(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get recipe by id' })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  getRecipeById(@Param('id') id: string) {
    return this.recipeService.getRecipeById(id);
  }

  @Post()
  @RequireAdmin()
  @ApiOperation({ summary: 'Create recipe' })
  createRecipe(@Query() dto: CreateRecipeDto) {
    return this.recipeService.createRecipe(dto);
  }

  @Patch(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Update recipe' })
  updateRecipe(
    @Param('id') id: string,
    @Body() dto: UpdateRecipeDto,
  ) {
    return this.recipeService.updateRecipe(id, dto);
  }

  @Delete(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Delete recipe' })
  deleteRecipe(@Param('id') id: string) {
    return this.recipeService.deleteRecipe(id);
  }
}
