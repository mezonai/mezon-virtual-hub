import { BaseService } from '@libs/base/base.service';
import { CreateIngredientDto, ExchangeRecipeDto, UpdateIngredientDto } from './dto/ingredient.dto';
import { IngredientEntity } from '@modules/ingredient/entity/ingredient.entity';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { InventoryService } from '@modules/inventory/inventory.service';
import { PetPlayersService } from '@modules/pet-players/pet-players.service';
import { ItemType } from '@enum';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { RecipeService } from '@modules/recipe/recipe.service';

@Injectable()
export class IngredientService extends BaseService<IngredientEntity> {
  constructor(
    @InjectRepository(IngredientEntity)
    private readonly ingredientRepo: Repository<IngredientEntity>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(ItemEntity)
    private readonly itemRepo: Repository<ItemEntity>,
    private readonly inventoryService: InventoryService,
    private readonly petPlayersService: PetPlayersService,
    private readonly recipeService: RecipeService,
  ) {
    super(ingredientRepo, IngredientEntity.name);
  }

  async getAllIngredients(recipeId: string) {
    return this.ingredientRepo.find({
      where: { recipe_id: recipeId },
      relations: ['item', 'plant'],
      order: { part: 'ASC' },
    });
  }

  async getIngredientById(id: string) {
    const ingredient = await this.ingredientRepo.findOne({
      where: { id },
      relations: ['recipe', 'item', 'plant'],
    });

    if (!ingredient) {
      throw new NotFoundException('Ingredient not found');
    }

    return ingredient;
  }

  async assembleIngredientToRecipe(user: UserEntity, recipeId: string, quantity: number = 1) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const recipe = await this.recipeService.getRecipeById(recipeId);

    if (!recipe.ingredients?.length) {
      throw new BadRequestException('Recipe has no ingredients');
    }

    for (const ing of recipe.ingredients) {
      const inventory = await this.inventoryRepo.findOne({
        where: {
          user: { id: user.id },
          item: { id: ing.item!.id },
        },
      });

      if (!inventory || inventory.quantity < ing.required_quantity * quantity) {
        throw new BadRequestException(
          'Not enough fragment items to assemble recipe',
        );
      }
    }

    for (const ing of recipe.ingredients) {
      const inventory = await this.inventoryRepo.findOne({
        where: {
          user: { id: user.id },
          item: { id: ing.item!.id },
        },
      });

      if (!inventory) {
        throw new NotFoundException('Inventory not found for ingredient');
      }

      inventory.quantity -= ing.required_quantity * quantity;

      if (inventory.quantity <= 0) {
        await this.inventoryRepo.remove(inventory);
      } else {
        await this.inventoryRepo.save(inventory);
      }
    }

    await this.petPlayersService.createPetPlayers({
      room_code: '',
      user_id: user.id,
      pet_id: recipe.pet_id,
      current_rarity: recipe.pet?.rarity,
    },quantity);

    return {
      success: true,
      quantity,
      pet: recipe.pet,
    };
  }

  async randomIngredientByRecipeId(recipeId: string) {
    const recipe = await this.recipeService.getRecipeById(recipeId);

    if (!recipe.ingredients?.length) {
      throw new BadRequestException('Recipe has no ingredients');
    }

    const randomIngredient =
      recipe.ingredients[
      Math.floor(Math.random() * recipe.ingredients.length)
      ];

    return randomIngredient.item!.id;
  }

  async exchangeExcessIngredients(user: UserEntity, dto: ExchangeRecipeDto) {
    const { minExchange, recipeId } = dto;

    const recipe = await this.recipeService.getRecipeById(recipeId);

    if (!recipe.pet) {
      throw new NotFoundException('Pet recipe not found');
    }

    const ownFragmentsInventory = await this.inventoryService.getListFragmentItemsBySpecies(
      user,
      recipe.pet.species,
    );

    if (!ownFragmentsInventory.fragmentItems.length) {
      throw new BadRequestException('No fragment found');
    }

    const excessList = ownFragmentsInventory.fragmentItems
      .map((f) => ({
        itemId: f.item.id,
        excessQuantity: Math.max(0, f.quantity - 1),
      }))
      .filter((f) => f.excessQuantity > 0);

    if (!excessList.length) {
      throw new BadRequestException('No excess fragment');
    }

    const pool: string[] = [];

    for (const f of excessList) {
      for (let i = 0; i < f.excessQuantity; i++) {
        pool.push(f.itemId);
      }
    }

    if (pool.length < minExchange) {
      throw new BadRequestException('Not enough fragment excess');
    }

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const selected = pool.slice(0, minExchange);

    const takenMap: Record<string, number> = {};
    for (const itemId of selected) {
      takenMap[itemId] = (takenMap[itemId] || 0) + 1;
    }

    const removedItems: ItemEntity[] = [];

    for (const [itemId, taken] of Object.entries(takenMap)) {
      const inventory = await this.inventoryRepo.findOne({
        where: {
          user: { id: user.id },
          item: { id: itemId },
        },
        relations: ['item'],
      });

      if (!inventory?.item) {
        throw new NotFoundException('Inventory not found for fragment');
      }

      inventory.quantity -= taken;
      await this.inventoryRepo.save(inventory);

      inventory.item['takenQuantity'] = taken;
      removedItems.push(inventory.item);
    }

    const rewardItemId =
      await this.randomIngredientByRecipeId(recipeId);

    const rewardItem = await this.itemRepo.findOne({
      where: { id: rewardItemId },
    });

    if (!rewardItem) {
      throw new NotFoundException('Reward item not found');
    }

    await this.inventoryService.addItemToInventory(
      user,
      rewardItemId,
    );

    return {
      removed: removedItems,
      reward: rewardItem,
    };
  }

  async createIngredient(dto: CreateIngredientDto) {
    const ingredient = this.ingredientRepo.create(dto);
    return this.ingredientRepo.save(ingredient);
  }

  async updateIngredient(id: string, dto: UpdateIngredientDto) {
    const ingredient = await this.getIngredientById(id);
    Object.assign(ingredient, dto);
    return this.ingredientRepo.save(ingredient);
  }

  async deleteIngredient(id: string) {
    const ingredient = await this.getIngredientById(id);
    await this.ingredientRepo.remove(ingredient);
    return { success: true };
  }
}
