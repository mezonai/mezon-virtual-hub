import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from '@libs/base/base.service';
import { RecipeEntity } from './entity/recipe.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreateRecipeDto,
  RecipeQueryDto,
  UpdateRecipeDto,
} from './dto/recipe.dto';
import { RecipeType } from '@enum';
import { TOOL_RATE_MAP } from '@constant/farm.constant';
import { ClanWarehouseEntity } from '@modules/clan-warehouse/entity/clan-warehouse.entity';
import { ClanFundEntity } from '@modules/clan-fund/entity/clan-fund.entity';
import { UserEntity } from '@modules/user/entity/user.entity';

@Injectable()
export class RecipeService extends BaseService<RecipeEntity> {
  constructor(
    @InjectRepository(RecipeEntity)
    private readonly recipeRepo: Repository<RecipeEntity>,
    @InjectRepository(ClanWarehouseEntity)
    private readonly clanWarehouseRepo: Repository<ClanWarehouseEntity>,
    @InjectRepository(ClanFundEntity)
    private readonly clanFundRepo: Repository<ClanFundEntity>,
  ) {
    super(recipeRepo, RecipeEntity.name);
  }

  async getAllRecipes(user: UserEntity, query: RecipeQueryDto) {
    const recipes = await this.recipeRepo
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.item', 'item')
      .leftJoinAndSelect('recipe.pet', 'pet')
      .leftJoinAndSelect('recipe.plant', 'plant')
      .leftJoinAndSelect('recipe.ingredients', 'ingredients')
      .leftJoinAndSelect('ingredients.item', 'ingredient_items')
      .leftJoinAndSelect('ingredients.plant', 'ingredient_plants')
      .where('recipe.type = :type', { type: query.type })
      .orderBy(`
        CASE
          WHEN item.item_code LIKE 'harvest_tool_%' THEN 1
          WHEN item.item_code LIKE 'growth_plant_tool_%' THEN 2
          WHEN item.item_code LIKE 'interrupt_harvest_tool_%' THEN 3
          ELSE 99
        END
      `,
        'ASC',
      )
      .addOrderBy('item.gold', 'ASC')
      .getMany();

    if (query.type === RecipeType.FARM_TOOL) {
      for (const recipe of recipes) {
        recipe.item!['rate'] = TOOL_RATE_MAP[recipe.item?.item_code!] ?? 0;
      }
    }

    if (!user.clan_id) {
      throw new BadRequestException('User is not in a clan');
    }
    const clanfund = await this.clanFundRepo.findOne({ where: { clan_id: user.clan_id } });

    for (const recipe of recipes) {
      for (const ingredient of recipe.ingredients!) {
        if (ingredient.plant_id) {
          const harvestedPlant = await this.clanWarehouseRepo.findOne({
            where: {
              clan_id: user.clan_id,
              plant_id: ingredient.plant_id,
              is_harvested: true,
            },
          });

          ingredient['current_quantity'] = harvestedPlant?.quantity ?? 0;
        }

        if (ingredient.gold > 0) {
          ingredient['current_quantity'] = clanfund ? clanfund.amount : 0;
        }
      }
    }

    return recipes;
  }

  async getRecipeById(id: string) {
    const recipe = await this.recipeRepo.findOne({
      where: { id },
      relations: ['ingredients', 'ingredients.item', 'ingredients.plant', 'pet', 'item', 'plant'],
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    return recipe;
  }

  async createRecipe(dto: CreateRecipeDto) {
    if (dto.pet_id) {
      const existingPetRecipe = await this.recipeRepo.findOne({
        where: { pet_id: dto.pet_id },
      });

      if (existingPetRecipe) {
        throw new BadRequestException(
          'A recipe for this pet already exists',
        );
      }
    }

    if (dto.item_id) {
      const existingItemRecipe = await this.recipeRepo.findOne({
        where: { item_id: dto.item_id },
      });

      if (existingItemRecipe) {
        throw new BadRequestException(
          'A recipe for this item already exists',
        );
      }
    }

    const recipe = this.recipeRepo.create({
      pet_id: dto.pet_id ?? dto.pet_id,
      item_id: dto.item_id ?? dto.item_id,
      type: dto.type,
    });

    return this.recipeRepo.save(recipe);
  }

  async updateRecipe(id: string, dto: UpdateRecipeDto) {
    const recipe = await this.getRecipeById(id);
    Object.assign(recipe, dto);
    return this.recipeRepo.save(recipe);
  }

  async deleteRecipe(id: string) {
    const recipe = await this.getRecipeById(id);

    if (recipe.ingredients?.length) {
      throw new BadRequestException(
        'Cannot delete recipe with ingredients',
      );
    }

    await this.recipeRepo.remove(recipe);
    return { success: true };
  }
}
