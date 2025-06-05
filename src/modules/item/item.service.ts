import { Gender } from '@enum';
import { BaseService } from '@libs/base/base.service';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { EntityManager, In, Not, Repository } from 'typeorm';
import { ItemDto, ItemDtoRequest } from './dto/item.dto';
import { ItemEntity } from './entity/item.entity';

@Injectable()
export class ItemService extends BaseService<ItemEntity> {
  constructor(
    @InjectRepository(ItemEntity)
    private readonly itemRepository: Repository<ItemEntity>,
    private manager: EntityManager,
  ) {
    super(itemRepository, ItemEntity.name);
  }

  async getAllItems() {
    const items = await this.find();
    return plainToInstance(ItemDto, items);
  }

  async getItemById(id: string) {
    const item = await this.findById(id);
    if (!item) {
      throw new Error('Item not found');
    }
    return item;
  }

  async createItem(createItemDto: ItemDtoRequest) {
    const newItem = this.itemRepository.create(createItemDto);
    await this.itemRepository.save(newItem);

    return plainToInstance(ItemDto, newItem);
  }

  async updateItem(updateItem: ItemDtoRequest, itemId: string) {
    const existedItem = await this.itemRepository.findOne({
      where: {
        id: itemId,
      },
    });

    if (!existedItem) {
      throw new NotFoundException(`Item ${itemId} not found`);
    }

    await this.itemRepository.update(itemId, updateItem);

    Object.assign(existedItem, updateItem);
    return plainToInstance(ItemDto, existedItem);
  }

  async deleteItem(id: string) {
    const result = await this.itemRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Item not found');
    }
    return { deleted: true };
  }

  async getAvailableItems(
    gender: Gender,
    ownedItems: Inventory[],
  ): Promise<ItemEntity[]> {
    const ownedItemIds = ownedItems.map((inv) => inv.item?.id);
    return await this.itemRepository.find({
      where: {
        gender: In([gender, Gender.NOT_SPECIFIED]),
        id: Not(In(ownedItemIds)),
      },
    });
  }
}
