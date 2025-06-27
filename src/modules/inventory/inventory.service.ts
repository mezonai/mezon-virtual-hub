import { InventoryType, PurchaseMethod } from '@enum';
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

@Injectable()
export class InventoryService extends BaseService<Inventory> {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userService: UserService,
    @InjectRepository(ItemEntity)
    private readonly itemRepository: Repository<ItemEntity>,
    private readonly foodService: FoodService,
  ) {
    super(inventoryRepository, Inventory.name);
  }

  async buyItem(
    userId: string,
    itemId: string,
    quantity = 1,
  ): Promise<Inventory> {
    return this.userService.processUserTransaction(
      userId, async (user) => {
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

        if (!item.is_stackable && quantity > 1) {
          throw new BadRequestException(
            'You already own this item and cannot have more than one.',
          );
        }

        if (inventory) {
          inventory.quantity += quantity;
          await this.inventoryRepository.update(inventory.id, inventory);
        } else {
          inventory = await this.addItemToInventory(user, item, quantity);
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
      },
    );
  }

  async buyFood(userId: string, foodId: string, quantity = 1) {
    return this.userService.processUserTransaction(
      userId, async (user) => {
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

        await this.addFoodToInventory(user, food, quantity);
        await this.userRepository.save(user);

        return {
          message: 'Food purchased successfully',
          user_balance: {
            gold: user.gold,
            diamond: user.diamond,
          },
        };
      },
    );
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
    item: ItemEntity,
    quantity = 1,
  ): Promise<Inventory> {
    const newInventoryItem = this.inventoryRepository.create({
      user,
      item,
      quantity,
      inventory_type: InventoryType.ITEM,
    });
    return await this.inventoryRepository.save(newInventoryItem);
  }

  async addFoodToInventory(
    user: UserEntity,
    food: FoodEntity,
    quantity = 1,
  ): Promise<Inventory> {
    let inventory = await this.inventoryRepository.findOne({
      where: {
        user: { id: user.id },
        food: { id: food.id },
        inventory_type: InventoryType.FOOD,
      },
    });

    if (!inventory) {
      inventory = this.inventoryRepository.create({
        user,
        food,
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
}
