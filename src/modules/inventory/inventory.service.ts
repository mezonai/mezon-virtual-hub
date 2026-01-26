import {
  InventoryType,
  ItemType,
  PurchaseMethod,
  QuestType,
  RewardItemType
} from '@enum';
import { BaseService } from '@libs/base/base.service';
import { Logger } from '@libs/logger';
import { FoodService } from '@modules/food/food.service';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { PetPlayersService } from '@modules/pet-players/pet-players.service';
import { QuestEventEmitter } from '@modules/player-quest/events/quest.events';
import { RewardItemEntity } from '@modules/reward-item/entity/reward-item.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { UserService } from '@modules/user/user.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { In, Repository } from 'typeorm';
import { FoodInventoryResDto, ItemInventoryResDto } from './dto/inventory.dto';
import { SlotWheelEntity } from '@modules/slot-wheel/entity/slot-wheel.entity';
import { CLanWarehouseService } from '@modules/clan-warehouse/clan-warehouse.service';
import { PlantService } from '@modules/plant/plant.service';
import { RecipeEntity } from '@modules/recipe/entity/recipe.entity';

@Injectable()
export class InventoryService extends BaseService<Inventory> {
  private readonly logger = new Logger(InventoryService.name);
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userService: UserService,
    @InjectRepository(ItemEntity)
    private readonly itemRepository: Repository<ItemEntity>,
    @InjectRepository(RecipeEntity)
    private readonly recipeRepo: Repository<RecipeEntity>,
    private readonly foodService: FoodService,
    private readonly petPlayerService: PetPlayersService,
    private readonly clanWarehouseService: CLanWarehouseService,
    private readonly plantService: PlantService,
  ) {
    super(inventoryRepository, Inventory.name);
  }

  async buyItem(
    userId: string,
    itemId: string,
    quantity = 1,
  ): Promise<Inventory> {
    return this.userService.processUserTransaction(userId, async (user) => {
      const item = await this.itemRepository.findOne({
        where: { id: itemId },
      });
      if (!item) {
        throw new NotFoundException('Item not found');
      }

      if (!item.is_purchasable) {
        throw new BadRequestException('Item cannot be purchased');
      }

      if (user.gold < item.gold * quantity) {
        throw new BadRequestException('Not enough gold');
      }

      let inventory = await this.inventoryRepository.findOne({
        where: { user: { id: user.id }, item: { id: itemId } },
      });

      if (!item.is_stackable) {
        if (quantity > 1) {
          throw new BadRequestException(
            'This item and cannot have more than one.',
          );
        }

        if (inventory && inventory?.quantity >= 1) {
          throw new BadRequestException(
            'This item can be owned more than one.',
          );
        }
      }

      if (inventory) {
        inventory.quantity += quantity;
        await this.inventoryRepository.update(inventory.id, inventory);
      } else {
        inventory = await this.addItemToInventory(user, item.id, quantity);
      }

      user.gold -= item.gold;
      await this.userRepository.save(user);

      const response_inventory_data = {
        inventory_data: {
          id: inventory.id,
          equipped: inventory.equipped,
          quantity: inventory.quantity,
          item: inventory.item,
        },
      };

      const response_data = {
        ...response_inventory_data,
        user_gold: user.gold,
      };
      return plainToInstance(Inventory, response_data);
    });
  }

  async buyFood(userId: string, foodId: string, quantity = 1) {
    return this.userService.processUserTransaction(userId, async (user) => {
      const food = await this.foodService.findById(foodId);

      if (!food) {
        throw new NotFoundException('Food not found');
      }

      if (food.purchase_method === PurchaseMethod.SLOT) {
        throw new BadRequestException(
          'This food cannot be purchased (slot only)',
        );
      }

      const price = food.price * quantity;

      if (food.purchase_method === PurchaseMethod.GOLD) {
        if (user.gold < price) {
          throw new BadRequestException('Not enough gold');
        }
        user.gold -= price;
      } else if (food.purchase_method === PurchaseMethod.DIAMOND) {
        if (user.diamond < price) {
          throw new BadRequestException('Not enough diamond');
        }
        user.diamond -= price;
      }

      await this.addFoodToInventory(user, food.id, quantity);
      await this.userRepository.save(user);
      QuestEventEmitter.emitProgress(user.id, QuestType.BUY_FOOD, 1);
      return {
        message: 'Food purchased successfully',
        user_balance: {
          gold: user.gold,
          diamond: user.diamond,
        },
      };
    });
  }

  async getUserInventory(userId: string): Promise<Inventory[]> {
    return await this.inventoryRepository.find({
      where: { user: { id: userId }, inventory_type: InventoryType.ITEM },
      relations: ['item'],
    });
  }

  async getUserInventoryItem(
    userId: string,
    itemId: string,
  ): Promise<Inventory | null> {
    return this.inventoryRepository.findOne({
      where: {
        user: { id: userId },
        item: { id: itemId },
        inventory_type: InventoryType.ITEM,
      },
    });
  }

  async addItemToInventory(
    user: UserEntity,
    itemId: string,
    quantity = 1,
  ): Promise<Inventory> {

    const existingInventory = await this.inventoryRepository.findOne({
      where: {
        user: { id: user.id },
        item: { id: itemId },
      },
    });

    if (existingInventory) {
      existingInventory.quantity += quantity;
      return await this.inventoryRepository.save(existingInventory);
    }

    const newInventoryItem = this.inventoryRepository.create({
      user: { id: user.id },
      item: { id: itemId },
      quantity,
      inventory_type: InventoryType.ITEM,
    });

    return await this.inventoryRepository.save(newInventoryItem);
  }

  async addFoodToInventory(
    user: UserEntity,
    foodId: string,
    quantity = 1,
  ): Promise<Inventory> {
    let inventory = await this.inventoryRepository.findOne({
      where: {
        user: { id: user.id },
        food: { id: foodId },
        inventory_type: InventoryType.FOOD,
      },
    });

    if (!inventory) {
      inventory = this.inventoryRepository.create({
        user,
        food: { id: foodId },
        quantity,
        inventory_type: InventoryType.FOOD,
      });
    } else {
      inventory.quantity += quantity;
    }

    return await this.inventoryRepository.save(inventory);
  }

  async getAllFoodsOfUser(user: UserEntity) {
    const inventory = await this.find({
      where: {
        user: {
          id: user.id,
        },
        inventory_type: InventoryType.FOOD,
      },
      relations: ['food'],
    });

    return plainToInstance(FoodInventoryResDto, inventory);
  }

  async getAllItemsOfUser(user: UserEntity) {
    const inventory = await this.find({
      where: {
        user: {
          id: user.id,
        },
        inventory_type: InventoryType.ITEM,
      },
      relations: ['item'],
    });

    return plainToInstance(ItemInventoryResDto, inventory);
  }

  async processRewardItems(user: UserEntity, rewards: RewardItemEntity[]) {
    let diamondDelta = 0;
    let goldDelta = 0;

    for (const reward of rewards) {
      switch (reward.type) {
        case RewardItemType.DIAMOND: {
          diamondDelta += reward.quantity;
          break;
        }

        case RewardItemType.GOLD: {
          goldDelta += reward.quantity;
          break;
        }

        case RewardItemType.ITEM: {
          if (!reward.item_id) {
            this.logger.warn(
              `Reward ITEM missing item_id for user=${user.username}, rewardId=${reward.id}`,
            );
            break;
          }

          const item = await this.itemRepository.findOne({
            where: { id: reward.item_id },
          });

          if (!item) {
            this.logger.warn(
              `Item not found: item_id=${reward.item_id}, user=${user.username}`,
            );
            break;
          }

          let inventoryItem = await this.getUserInventoryItem(
            user.id,
            reward.item_id,
          );

          if (!inventoryItem) {
            await this.addItemToInventory(user, item.id);
          } else if (item.is_stackable) {
            inventoryItem.quantity += reward.quantity;
            await this.save(inventoryItem);
          }
          break;
        }

        case RewardItemType.FOOD: {
          if (!reward.food_id) {
            this.logger.warn(
              `Reward FOOD missing food_id for user=${user.username}, rewardId=${reward.id}`,
            );
            break;
          }

          const addedFood = await this.addFoodToInventory(user, reward.food_id, reward.quantity);
          if (!addedFood) {
            this.logger.warn(
              `Food not found: food_id=${reward.food_id}, user=${user.username}`,
            );
          }
          break;
        }

        case RewardItemType.PET: {
          if (!reward.pet_id) {
            this.logger.warn(
              `Reward PET missing pet_id for user=${user.username}, rewardId=${reward.id}`,
            );
            break;
          }

          const pet = await this.petPlayerService.createPetPlayers({
            room_code: '',
            user_id: user.id,
            pet_id: reward.pet_id,
            current_rarity: reward.metadata?.rarity,
          });

          if (!pet) {
            this.logger.warn(
              `Pet not found: pet_id=${reward.pet_id}, user=${user.username}`,
            );
          }
          break;
        }

        default: {
          this.logger.warn(
            `Unknown reward type=${reward.type}, user=${user.username}, rewardId=${reward.id}`,
          );
          break;
        }
      }
    }

    if (diamondDelta || goldDelta) {
      user.diamond += diamondDelta;
      user.gold += goldDelta;
      await this.userRepository.update(user.id, {
        diamond: user.diamond,
        gold: user.gold,
      });
    }
  }

  async awardSpinItemToUser(user: UserEntity, rewardItems: SlotWheelEntity[]) {
    let goldDelta = 0;

    for (const rewardItem of rewardItems) {
      switch (rewardItem.type_item) {
        case RewardItemType.GOLD: {
          goldDelta += rewardItem.quantity;
          break;
        }

        case RewardItemType.ITEM: {
          if (!rewardItem.item_id) {
            this.logger.warn(
              `Reward ITEM missing item_id for user=${user.username}, rewardId=${rewardItem.id}`,
            );
          }

          const item = await this.itemRepository.findOne({
            where: { id: rewardItem.item_id! },
          });

          if (!item) {
            this.logger.warn(
              `Item not found: item_id=${rewardItem.item_id}, user=${user.username}`,
            );
            break;
          }

          let inventoryItem = await this.getUserInventoryItem(
            user.id,
            rewardItem.item_id!,
          );

          if (!inventoryItem) {
            await this.addItemToInventory(user, item.id);
          } else if (item.is_stackable) {
            inventoryItem.quantity += rewardItem.quantity;
            await this.save(inventoryItem);
          }
          break;
        }

        case RewardItemType.FOOD: {
          if (!rewardItem.food_id) {
            this.logger.warn(
              `Reward FOOD missing food_id for user=${user.username}, rewardId=${rewardItem.id}`,
            );
            break;
          }

          const addedFood = await this.addFoodToInventory(user, rewardItem.food_id, rewardItem.quantity);
          if (!addedFood) {
            this.logger.warn(
              `Food not found: food_id=${rewardItem.food_id}, user=${user.username}`,
            );
          }
          break;
        }

        case RewardItemType.PET: {
          if (!rewardItem.pet_id) {
            this.logger.warn(
              `Reward PET missing pet_id for user=${user.username}, rewardId=${rewardItem.id}`,
            );
            break;
          }

          const addedPet = await this.petPlayerService.createPetPlayers({
            room_code: '',
            user_id: user.id,
            pet_id: rewardItem.pet_id,
            current_rarity: rewardItem.pet!.rarity,
          });
          if (!addedPet) {
            this.logger.warn(
              `Pet not found: pet_id=${rewardItem.pet_id}, user=${user.username}`,
            );
          }
          break;
        }

        case RewardItemType.PLANT: {
          if (!rewardItem.plant_id) {
            this.logger.warn(
              `Reward Plant missing plant_id for user=${user.username}, rewardId=${rewardItem.id}`,
            );
            break;
          }

          if (!user.clan_id) {
            const plant = await this.plantService.getPlantById(rewardItem.plant_id);
            if (!plant) {
              this.logger.warn(
                `Plant not found: plant_id=${rewardItem.plant_id}, user=${user.username}`,
              );
              break;
            }

            goldDelta += plant.buy_price * rewardItem.quantity;
            break;
          } else {
            const addedPlants = await this.clanWarehouseService.rewardSeedToClans(
              user.clan_id!,
              rewardItem.plant_id,
              rewardItem.quantity,
            );
            if (!addedPlants) {
              this.logger.warn(
                `Plant not found: plant_id=${rewardItem.plant_id}, user=${user.username}`,
              );
            }
            break;
          }
        }

        default:
          this.logger.warn(
            `Unknown slot wheel reward type_item=${rewardItem.type_item}, user=${user.username}, rewardId=${rewardItem.id}`,
          );
          break;
      }
    }
    if (goldDelta > 0) {
      user.gold += goldDelta;
      await this.userRepository.update(user.id, { gold: user.gold });
    }
  }

  async getItemsByType(user: UserEntity, type: ItemType) {
    if (type === ItemType.PET_FOOD) {
      const inventory = await this.find({
        where: {
          user: { id: user.id },
          inventory_type: InventoryType.FOOD,
        },
        relations: ['food'],
      });
      return plainToInstance(FoodInventoryResDto, inventory);
    }
    
    const inventory = await this.find({
      where: {
        user: { id: user.id },
        item: { type },
        inventory_type: InventoryType.ITEM,
      },
      relations: ['item'],
    });

    if (type === ItemType.PET_FRAGMENT) {
      const recipes = await this.recipeRepo.find({
        where: { ingredients: { item: { type: ItemType.PET_FRAGMENT } } },
        relations: ['pet', 'ingredients', 'ingredients.item'],
      });

      if (!recipes.length) {
        throw new NotFoundException('Recipe not found for pet fragments');
      }

      const fragmentMap = new Map<
        string,
        { index: number; species?: string }
      >();

      for (const recipe of recipes) {
        for (const ing of recipe.ingredients ?? []) {
          if (!ing.item) continue;

          fragmentMap.set(ing.item.id, {
            index: ing.part,
            species: recipe.pet?.species,
          });
        }
      }

      for (const inv of inventory) {
        if (!inv.item) continue;

        const data = fragmentMap.get(inv.item?.id);
        if (!data) continue;

        inv.item['index'] = data.index;
        inv['species'] = data.species;
      }
    }

    return plainToInstance(ItemInventoryResDto, inventory);
  }

  async getListFragmentItemsBySpecies(user: UserEntity, species: string) {
    const recipe = await this.recipeRepo.findOne({
      where: { pet: { species } },
      relations: ['ingredients', 'ingredients.item'],
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found for the given species');
    }

    if (!recipe.ingredients?.length) {
      throw new BadRequestException('Recipe has no ingredients');
    }

    const itemIds = recipe.ingredients
      .filter(i => i.item?.type === ItemType.PET_FRAGMENT)
      .map(i => i.item!.id);

    const inventories = await this.inventoryRepository.find({
      where: {
        user: { id: user.id },
        inventory_type: InventoryType.ITEM,
        item: { id: In(itemIds) },
      },
      relations: ['item'],
    });

    const inventoryMap = new Map(
      inventories.map(inv => [inv.item!.id, inv]),
    );

    const fragmentItems = recipe.ingredients
      .filter(i => i.item?.type === ItemType.PET_FRAGMENT)
      .map(ingredient => {
        const inventory = inventoryMap.get(ingredient.item!.id);

        if (inventory) {
          if (!inventory.item) {
            throw new NotFoundException('Item not found in inventory');
          }

          inventory.item['index'] = ingredient.part;
          return inventory;
        }

        return {
          id: null,
          inventory_type: InventoryType.ITEM,
          equipped: false,
          quantity: 0,
          item: {
            ...ingredient.item,
            index: ingredient.part,
          }
        };
      })

    return {
      recipe_id: recipe.id,
      species,
      fragmentItems: plainToInstance(ItemInventoryResDto, fragmentItems.reverse()),
    };
  }

}
