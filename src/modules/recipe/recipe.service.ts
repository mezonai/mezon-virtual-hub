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
import { InventoryType, RecipeType } from '@enum';
import { TOOL_RATE_MAP } from '@constant/farm.constant';
import { ClanWarehouseEntity } from '@modules/clan-warehouse/entity/clan-warehouse.entity';
import { ClanFundEntity } from '@modules/clan-fund/entity/clan-fund.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { PetsEntity } from '@modules/pets/entity/pets.entity';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { PlantEntity } from '@modules/plant/entity/plant.entity';
import { PetClanEntity } from '@modules/pet-clan/entity/pet-clan.entity';
import { MapEntity } from '@modules/map/entity/map.entity';
import { DecorItemEntity } from '@modules/decor-item/entity/decor-item.entity';
import { ClanAnimalEntity } from '@modules/clan-animals/entity/clan-animal.entity';
import { ClanEntity } from '@modules/clan/entity/clan.entity';
import { ClanEstateEntity } from '@modules/clan-estate/entity/clan-estate.entity';
import { ClanDecorInventoryEntity } from '@modules/clan-decor-invetory/entity/clan-decor-inventory.entity';

@Injectable()
export class RecipeService extends BaseService<RecipeEntity> {
  constructor(
    @InjectRepository(RecipeEntity)
    private readonly recipeRepo: Repository<RecipeEntity>,
    @InjectRepository(ClanWarehouseEntity)
    private readonly clanWarehouseRepo: Repository<ClanWarehouseEntity>,
    @InjectRepository(ClanFundEntity)
    private readonly clanFundRepo: Repository<ClanFundEntity>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(PetsEntity)
    private readonly petsRepository: Repository<PetsEntity>,
    @InjectRepository(ItemEntity)
    private readonly itemRepository: Repository<ItemEntity>,
    @InjectRepository(PlantEntity)
    private readonly plantRepository: Repository<PlantEntity>,
    @InjectRepository(PetClanEntity)
    private readonly petClanRepository: Repository<PetClanEntity>,
    @InjectRepository(MapEntity)
    private readonly mapRepository: Repository<MapEntity>,
    @InjectRepository(DecorItemEntity)
    private readonly decorItemRepository: Repository<DecorItemEntity>,
    @InjectRepository(ClanAnimalEntity)
    private readonly clanAnimalRepository: Repository<ClanAnimalEntity>,
    @InjectRepository(ClanEntity)
    private readonly clanRepository: Repository<ClanEntity>,
    @InjectRepository(ClanEstateEntity)
    private readonly clanEstateRepo: Repository<ClanEstateEntity>,
    @InjectRepository(ClanDecorInventoryEntity)
    private readonly clanInventoryRepo: Repository<ClanDecorInventoryEntity>,
  ) {
    super(recipeRepo, RecipeEntity.name);
  }

  async getAllRecipes(user: UserEntity, query: RecipeQueryDto) {
    const recipes = await this.recipeRepo
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.item', 'item')
      .leftJoinAndSelect('recipe.pet', 'pet')
      .leftJoinAndSelect('recipe.plant', 'plant')
      .leftJoinAndSelect('recipe.map', 'map')
      .leftJoinAndSelect('recipe.decor_item', 'decor_item')
      .leftJoinAndSelect('recipe.pet_clan', 'pet_clan')
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

    if (!user.clan_id) {
      throw new BadRequestException('User is not in a clan');
    }
    const clanfund = await this.clanFundRepo.findOne({ where: { clan_id: user.clan_id } });

    for (const recipe of recipes) {
      if (recipe.type === RecipeType.PET_CLAN) {
        const clanAnimals = await this.clanAnimalRepository.findOne({
          where: {
            clan_id: user.clan_id,
            pet_clan_id: recipe.pet_clan_id,
          },
        });
        recipe.pet_clan!['current_pet_quantity'] = clanAnimals ? 1 : 0;
        recipe.pet_clan!['max_pet_quantity'] = 1;
      }

      if (query.type === RecipeType.PET_CLAN_SLOT) {
        const clan = await this.clanRepository.findOne({
          where: { id: user.clan_id },
        });
        recipe['current_slot_quantity'] = clan?.max_slot_pet_active ?? 0;
        
        for (const ingredient of recipe.ingredients || []) {
          ingredient.required_quantity = ingredient.required_quantity * (clan?.max_slot_pet_active ?? 0);
        }
      }

      if (query.type === RecipeType.DECOR_ITEM) {
        const decorInventory = await this.clanInventoryRepo.findOne({
          where: {
            clan: { id: user.clan_id },
            decorItem: { id: recipe.decor_item_id },
          },
        });
        recipe.decor_item!['current_decor_item_quantity'] = decorInventory ? 1 : 0;
        recipe.decor_item!['max_decor_item_quantity'] = 1;
      }

      if (query.type === RecipeType.MAP) {
        const clanEstate = await this.clanEstateRepo.findOne({
          where: {
            clan: { id: user.clan_id },
            realEstate: { id: recipe.map_id },
          },
        });
        recipe.map!['current_map_quantity'] = clanEstate ? 1 : 0;
        recipe.map!['max_map_quantity'] = 1;
      }

      if (query.type === RecipeType.FARM_TOOL) {
        recipe.item!['rate'] = TOOL_RATE_MAP[recipe.item?.item_code!] ?? 0;
      }

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

        if (ingredient.item_id) {
          const inventoryItem = await this.inventoryRepository.findOne({
            where: {
              user: { id: user.id },
              item: { id: ingredient.item_id },
              inventory_type: InventoryType.ITEM,
            },
          });

          ingredient['current_quantity'] = inventoryItem?.quantity ?? 0;
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
      relations: ['ingredients', 'ingredients.item', 'ingredients.plant', 'pet', 'item', 'plant', 'pet_clan'],
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    return recipe;
  }

  async createRecipe(dto: CreateRecipeDto) {
    if (dto.pet_id) {
      const pet = await this.petsRepository.findOne({
        where: { id: dto.pet_id },
      });

      if (!pet) throw new NotFoundException('Pet not found');

      const existingPetRecipe = await this.recipeRepo.findOne({
        where: { pet_id: dto.pet_id },
      });

      if (existingPetRecipe) throw new BadRequestException('A recipe for this pet already exists');
    }

    if (dto.item_id) {
      const item = await this.itemRepository.findOne({
        where: { id: dto.item_id },
      });

      if (!item) throw new NotFoundException('Item not found');

      const existingItemRecipe = await this.recipeRepo.findOne({
        where: { item_id: dto.item_id },
      });

      if (existingItemRecipe) throw new BadRequestException('A recipe for this item already exists');
    }

    if (dto.plant_id) {
      const plant = await this.plantRepository.findOne({
        where: { id: dto.plant_id },
      });

      if (!plant) throw new NotFoundException('Plant not found');

      const existingPlantRecipe = await this.recipeRepo.findOne({
        where: { plant_id: dto.plant_id },
      });

      if (existingPlantRecipe) throw new BadRequestException('A recipe for this plant already exists');
    }

    if (dto.pet_clan_id) {
      const petClan = await this.petClanRepository.findOne({
        where: { id: dto.pet_clan_id },
      });

      if (!petClan) throw new NotFoundException('Pet clan not found');

      const existingPetClanRecipe = await this.recipeRepo.findOne({
        where: { pet_clan_id: dto.pet_clan_id },
      });

      if (existingPetClanRecipe) throw new BadRequestException('A recipe for this pet clan already exists');
    }

    if (dto.map_id) {
      const map = await this.mapRepository.findOne({
        where: { id: dto.map_id },
      });

      if (!map) throw new NotFoundException('Map not found');

      const existingMapRecipe = await this.recipeRepo.findOne({
        where: { map_id: dto.map_id },
      });

      if (existingMapRecipe) throw new BadRequestException('A recipe for this map already exists');
    }

    if (dto.decor_item_id) {
      const decorItem = await this.decorItemRepository.findOne({
        where: { id: dto.decor_item_id },
      });

      if (!decorItem) throw new NotFoundException('Decor item not found');

      const existingDecorItemRecipe = await this.recipeRepo.findOne({
        where: { decor_item_id: dto.decor_item_id },
      });

      if (existingDecorItemRecipe) throw new BadRequestException('A recipe for this decor item already exists');
    }

    const recipe = this.recipeRepo.create({
      pet_id: dto.pet_id ?? dto.pet_id,
      item_id: dto.item_id ?? dto.item_id,
      plant_id: dto.plant_id ?? dto.plant_id,
      pet_clan_id: dto.pet_clan_id ?? dto.pet_clan_id,
      map_id: dto.map_id ?? dto.map_id,
      decor_item_id: dto.decor_item_id ?? dto.decor_item_id,
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
