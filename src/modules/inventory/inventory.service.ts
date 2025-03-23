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
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ItemEntity)
    private readonly itemRepository: Repository<ItemEntity>,
  ) { }

  async buyItem(user: UserEntity, itemId: string): Promise<Inventory> {
    const item = await this.itemRepository.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException('Item not found');
    }

    if (user.gold < item.gold) {
      throw new BadRequestException('Not enough gold');
    }

    user.gold -= item.gold;
    await this.userRepository.save(user);

    const inventory = this.inventoryRepository.create({
      user,
      item,
      equipped: false,
    });

    await this.inventoryRepository.save(inventory);

    let response_inventory_data = {
      inventory_data: {
        id: inventory.id,
        equipped: inventory.equipped,
        item: item
      }
    }
    const response_data = { ...response_inventory_data, user_gold: user.gold };
    return plainToInstance(Inventory, response_data);
  }
}
