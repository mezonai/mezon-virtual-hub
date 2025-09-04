import {
  InventoryType,
  PurchaseMethod,
  QuestType,
  RewardItemType,
  RewardSlotType,
} from '@enum';
import { BaseService } from '@libs/base/base.service';
import { FoodEntity } from '@modules/food/entity/food.entity';
import { FoodService } from '@modules/food/food.service';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { UserService } from '@modules/user/user.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { FoodInventoryResDto, ItemInventoryResDto } from './dto/inventory.dto';
import { RewardDataType, AwardResponseDto } from '@modules/game/dto/game.dto';
import { RewardItemEntity } from '@modules/reward-item/entity/reward-item.entity';
import { Logger } from '@libs/logger';
import { PetPlayersService } from '@modules/pet-players/pet-players.service';
import { AdminPetPlayersService } from '@modules/admin/pet-players/pet-players.service';
import { QuestEventEmitter } from '@modules/player-quest/events/quest.events';

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
    private readonly foodService: FoodService,
    private readonly petPlayerService: PetPlayersService,
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
    const newInventoryItem = this.inventoryRepository.create({
      user,
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

          const addedFood = await this.addFoodToInventory(user, reward.food_id);
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
            user_id: user.id,
            pet_id: reward.pet_id,
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
}
