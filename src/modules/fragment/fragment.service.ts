import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '@libs/base/base.service';
import { FragmentEntity } from '@modules/fragment/entity/fragment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Inventory } from '@modules/inventory/entity/inventory.entity';
import { UserEntity } from '@modules/user/entity/user.entity';
import { InventoryService } from '@modules/inventory/inventory.service';
import { PetPlayersService } from '@modules/pet-players/pet-players.service';
import { CreateFragmentDto, UpdateFragmentDto } from '@modules/fragment/dto/fragment.dto';
import { ExchangeFragmentDto } from '@modules/slot-wheel/dto/slot-wheel.dto';
import { ItemType } from '@enum';
import { ItemEntity } from '@modules/item/entity/item.entity';

@Injectable()
export class FragmentService extends BaseService<FragmentEntity> {

  constructor(
    @InjectRepository(FragmentEntity)
    private readonly fragmentRepo: Repository<FragmentEntity>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(ItemEntity)
    private readonly itemRepo: Repository<ItemEntity>,
    private readonly inventoryService: InventoryService,
    private readonly petPlayersService: PetPlayersService,
  ) {
    super(fragmentRepo, FragmentEntity.name);
  }

  async getAllFragments() {
    return this.fragmentRepo.find({
      relations: ['fragmentItems', 'fragmentItems.item', 'pet'],
    });
  }

  async getFragmentById(id: string) {
    const fragment = await this.fragmentRepo.findOne({
      where: { id },
      relations: ['fragmentItems', 'fragmentItems.item', 'pet'],
    });

    if (!fragment) {
      throw new NotFoundException('Fragment not found');
    }

    return fragment;
  }

  async createFragment(dto: CreateFragmentDto) {
    const fragment = this.fragmentRepo.create({
      pet_id: dto.pet_id,
    });

    return this.fragmentRepo.save(fragment);
  }

  async assembleFragment(user: UserEntity, fragmentId: string) {
    const fragment = await this.getFragmentById(fragmentId);

    for (const fi of fragment.fragmentItems) {
      const inventory = await this.inventoryRepo.findOne({
        where: {
          user: { id: user.id },
          item: { id: fi.item.id },
        },
      });

      if (!inventory || inventory.quantity < fi.required_quantity) {
        throw new Error('Not enough fragment items to assemble fragment');
      }
    }

    for (const fi of fragment.fragmentItems) {
      const fragmentItem = await this.inventoryRepo.findOne({
        where: {
          user: { id: user.id },
          item: { id: fi.item.id },
        },
      });

      if (!fragmentItem) {
        throw new Error(`Missing fragment item: ${fi.item.name}`);
      }

      fragmentItem.quantity -= fi.required_quantity;

      if (fragmentItem.quantity <= 0) {
        await this.inventoryRepo.remove(fragmentItem);
      } else {
        await this.inventoryRepo.save(fragmentItem);
      }
    }

    await this.petPlayersService.createPetPlayers({
      room_code: '',
      user_id: user.id,
      pet_id: fragment.pet.id,
      current_rarity: fragment.pet.rarity,
    });

    return {
      success: true,
      pet: fragment.pet,
    };
  }

  async randomFragmentItemByFragmentId(fragmentId: string): Promise<string> {
    const fragment = await this.getFragmentById(fragmentId);

    if (!fragment.fragmentItems?.length) {
      throw new BadRequestException('Fragment has no fragment items');
    }

    const randomFragmentItem =
      fragment.fragmentItems[
      Math.floor(Math.random() * fragment.fragmentItems.length)
      ];

    return randomFragmentItem.item.id;
  }

  async exchangeFragmentItems(user: UserEntity, dto: ExchangeFragmentDto) {
    const { minExchange, fragmentId } = dto;

    const ownFragmentsInventory = await this.inventoryService.getItemsByType(
      user,
      ItemType.PET_FRAGMENT,
    );

    if (!ownFragmentsInventory.length) {
      throw new BadRequestException('No fragment found');
    }

    const excessList = ownFragmentsInventory
      .map(f => ({
        itemId: f.item.id,
        excessQuantity: Math.max(0, f.quantity - 1),
      }))
      .filter(f => f.excessQuantity > 0);

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

    let removedListFragmentItem: ItemEntity[] = [];

    for (const [fragmentItemId, taken] of Object.entries(takenMap)) {
      const fragmentInventory = await this.inventoryRepo.findOne({
        where: {
          user: { id: user.id },
          item: { id: fragmentItemId }
        },
        relations: ['item'],
      });

      if (!fragmentInventory?.item) {
        throw new NotFoundException('Inventory not found for fragment');
      }

      fragmentInventory.quantity -= taken;

      await this.inventoryRepo.save(fragmentInventory);
      fragmentInventory.item['takenQuantity'] = taken;
      removedListFragmentItem.push(fragmentInventory.item);
    }

    const rewardItemId = await this.randomFragmentItemByFragmentId(fragmentId);
    const rewardItem = await this.itemRepo.findOne({ where: { id: rewardItemId } });
    if (!rewardItem) {
      throw new NotFoundException('Reward item not found');
    }

    await this.inventoryService.addItemToInventory(user, rewardItemId);

    return {
      removed: removedListFragmentItem,
      reward: rewardItem,
    };
  }

  async updateFragment(id: string, dto: UpdateFragmentDto) {
    const fragment = await this.getFragmentById(id);

    Object.assign(fragment, dto);

    return this.fragmentRepo.save(fragment);
  }

  async deleteFragment(id: string) {
    const fragment = await this.getFragmentById(id);

    if (fragment.fragmentItems?.length) {
      throw new BadRequestException(
        'Cannot delete fragment with fragment items',
      );
    }

    await this.fragmentRepo.remove(fragment);

    return { success: true };
  }
}
