import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { ItemEntity } from '@modules/item/entity/item.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
  ) {}

  async buyItem(user: UserEntity, itemId: string): Promise<string> {
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

    return `Item ${item.name} purchased successfully!`;
  }
}
