import { BaseService } from '@libs/base/base.service';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

@Injectable()
export class InventoryService extends BaseService<Inventory> {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ItemEntity)
    private readonly itemRepository: Repository<ItemEntity>,
  ) {
    super(inventoryRepository, Inventory.name);
  }

  async buyItem(user: UserEntity, itemId: string): Promise<Inventory> {
    const item = await this.itemRepository.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (user.gold < item.gold) {
      throw new BadRequestException('Not enough gold');
    }

    let inventory = await this.inventoryRepository.findOne({
      where: { user: { id: user.id }, item: { id: itemId } },
    });

    if (inventory) {
      if (!item.is_stackable) {
        throw new BadRequestException(
          'You already own this item and cannot have more than one.',
        );
      }
      inventory.quantity += 1;
      await this.inventoryRepository.save(inventory);
    } else {
      inventory = this.inventoryRepository.create({
        user,
        item,
        equipped: false,
      });
    }

    user.gold -= item.gold;
    await this.userRepository.save(user);

    const response_inventory_data = {
      inventory_data: {
        id: inventory.id,
        equipped: inventory.equipped,
        quantity: inventory.quantity,
        item: item,
      },
    };

    const response_data = { ...response_inventory_data, user_gold: user.gold };
    return plainToInstance(Inventory, response_data);
  }

  async getUserInventory(userId: string): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      where: { user: { id: userId } },
      relations: ['item'],
    });
  }

  async getUserInventoryItem(
    userId: string,
    itemId: string,
  ): Promise<Inventory | null> {
    return this.inventoryRepository.findOne({
      where: { user: { id: userId }, item: { id: itemId } },
    });
  }

  async addItemToInventory(
    user: UserEntity,
    item: ItemEntity,
  ): Promise<Inventory> {
    const newInventoryItem = this.inventoryRepository.create({
      user,
      item,
      quantity: 1,
    });
    return this.inventoryRepository.save(newInventoryItem);
  }
}
